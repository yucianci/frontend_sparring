import axios from 'axios';
import type { Organization, SecurityObservations } from '../types';

const GRAPHQL_ENDPOINT =
  (import.meta.env?.VITE_GRAPHQL_URL as string | undefined) ??
  'http://54.164.151.205:3000/graphql';

const ORGANIZATIONS_QUERY = `
  query Organizations {
    organizations {
      id
      name
      pilots
      flightHours
      airships
      prompt
      securityObs
      generalObs
    }
  }
`;

const UPDATE_PROMPT_MUTATION = `
  mutation UpdateOrganizationPrompt($organizationId: ID!, $prompt: String!) {
    updateOrganizationPrompt(organizationId: $organizationId, prompt: $prompt) {
      id
      prompt
    }
  }
`;

type ApiOrganization = Omit<Organization, 'securityObs'> & {
  securityObs: string | Record<string, unknown> | null;
};

function normalizeSecurityObservations(
  raw: ApiOrganization['securityObs']
): SecurityObservations {
  if (!raw) {
    return {};
  }

  let parsed: unknown = raw;

  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      console.warn('Não foi possível fazer parse de securityObs como JSON.', error);
      return {};
    }
  }

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return {};
  }

  const observations: SecurityObservations = {};

  Object.entries(parsed as Record<string, unknown>).forEach(([rawKey, rawValue]) => {
    const key = rawKey.trim();
    if (!key) {
      return;
    }

    let values: string[] = [];

    if (Array.isArray(rawValue)) {
      values = rawValue
        .filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
        .map((item) => item.trim());
    } else if (typeof rawValue === 'string' && rawValue.trim().length > 0) {
      values = [rawValue.trim()];
    }

    if (values.length > 0) {
      observations[key] = values;
    }
  });

  return observations;
}

function transformOrganization(apiOrg: ApiOrganization): Organization {
  return {
    id: apiOrg.id,
    name: apiOrg.name,
    pilots: apiOrg.pilots,
    flightHours: apiOrg.flightHours,
    airships: apiOrg.airships,
    prompt: apiOrg.prompt,
    generalObs: apiOrg.generalObs,
    securityObs: normalizeSecurityObservations(apiOrg.securityObs),
  };
}

interface GraphQLResponse {
  data?: {
    organizations?: ApiOrganization[];
  };
  errors?: Array<{ message?: string }>;
}

export async function fetchOrganizations(): Promise<Organization[]> {
  const response = await axios.post<GraphQLResponse>(
    GRAPHQL_ENDPOINT,
    {
      query: ORGANIZATIONS_QUERY,
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const { data, errors } = response.data;

  if (errors && errors.length > 0) {
    const message = errors.map((error) => error.message).filter(Boolean).join(' | ');
    throw new Error(message || 'Erro ao buscar organizações.');
  }

  const organizations = data?.organizations ?? [];

  return organizations.map(transformOrganization);
}

interface UpdatePromptResponse {
  data?: {
    updateOrganizationPrompt?: {
      id: string;
      prompt: string;
    };
  };
  errors?: Array<{ message?: string }>;
}

export async function updateOrganizationPrompt(
  organizationId: string,
  prompt: string
): Promise<string> {
  const response = await axios.post<UpdatePromptResponse>(
    GRAPHQL_ENDPOINT,
    {
      query: UPDATE_PROMPT_MUTATION,
      variables: {
        organizationId,
        prompt,
      },
    },
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const { data, errors } = response.data;

  if (errors && errors.length > 0) {
    const message = errors.map((error) => error.message).filter(Boolean).join(' | ');
    throw new Error(message || 'Erro ao atualizar prompt da organização.');
  }

  const updatedPrompt = data?.updateOrganizationPrompt?.prompt;

  if (typeof updatedPrompt !== 'string') {
    throw new Error('Resposta inválida ao atualizar prompt da organização.');
  }

  return updatedPrompt;
}
