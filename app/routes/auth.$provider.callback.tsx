import { LoaderFunctionArgs } from "@remix-run/node"
import { authenticator } from '~/services/auth.server';

export let loader = async ({ request, params }: LoaderFunctionArgs) => {
  return await authenticator.authenticate(params.provider||'', request, {
    successRedirect: '/home',
    failureRedirect: '/login',
  });
};