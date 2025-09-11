export function generateLoginTokenMessage(params: {
  name: string;
  token: string;
}): string {
  const { name, token } = params;

  return `🔐 *PayBud Login Token*

Hi ${name}!

Your login token is: *${token}*

⏰ This token will expire in *30 minutes*

Please use it to complete your login. If you didn't request this token, please ignore this message.

Thanks,
PayBud Team`;
}
