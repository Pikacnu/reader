import nodemailer from 'nodemailer';
import { MailOptions } from 'nodemailer/lib/sendmail-transport';
import fs from 'fs';
const mailer = nodemailer.createTransport({
	service: 'postfix',
	host: '192.168.0.101',
	port: 25,
	secure: false,
	auth: {
		user: process.env.MAIL_USER,
		pass: process.env.MAIL_PASSWORD,
	},
	tls: {
		rejectUnauthorized: false,
	},
});

function readfile(filename: string) {
	return new Promise((resolve, reject) => {
		fs.readFile(filename, 'utf8', (err, data) => {
			if (err) {
				reject(err);
			} else {
				resolve(data);
			}
		});
	});
}
(async () => {
	let mailOptions: MailOptions = {
		from: 'laganto@pikacnu.com',
		to: 'pikacnu8777@gmail.com',
		subject: 'Hello',
		html: ((await readfile('./app/assests/verify.html')) as string).replace(
			'${verifycode}',
			'',
		),
	};

	mailer.sendMail(mailOptions, (err, info) => {
		if (err) {
			console.log(err);
		} else {
			console.log(info);
		}
	});
})();
