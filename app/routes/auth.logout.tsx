import { ActionFunctionArgs } from "@remix-run/node"
import { authenticator } from "~/services/auth.server";

export let loader = async ({ request }: ActionFunctionArgs) => {
  return await authenticator.logout(request, { redirectTo: "/" });
};

export let action = async ({ request, params }: ActionFunctionArgs) => {
  return await authenticator.logout(request, { redirectTo: "/" });
};