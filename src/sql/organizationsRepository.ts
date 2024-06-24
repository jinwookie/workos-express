import client from "./client";

interface CreateOrganizationRequest {
  orgId: string;
  slug: string;
}

interface Organization {
  org_id: string;
  slug: string;
}

export const createOrganization = async (org: CreateOrganizationRequest) => {
  const results = await client<
    Organization[]
  >`insert into organizations (org_id, slug) values (${org.orgId}, ${org.slug}) returning *`;
  return results[0];
};

export const getOrganization = async (orgId: string) => {
  const results = await client<
    Organization[]
  >`select * from organizations where org_id = ${orgId}`;
  return results[0];
};

export const getOrganizationBySlug = async (slug: string) => {
  const results = await client<
    Organization[]
  >`select * from organizations where slug = ${slug}`;
  return results[0];
};
