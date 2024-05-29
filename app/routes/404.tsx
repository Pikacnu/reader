import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export function loader({ request }: LoaderFunctionArgs) {
	return authenticator.isAuthenticated(request, {
		failureRedirect: '/',
		successRedirect: '/home',
	});
}

export default function NotFound() {
	return (
		<div className='flex flex-col items-center justify-center'>
			<h1 className='text-3xl'>404 Not Found</h1>
		</div>
	);
}
