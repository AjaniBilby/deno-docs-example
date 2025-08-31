export async function GetUserID(request: Request, cookies: Cookies): Promise<number | null> {
	return -1;
}

export async function UserLogin(request: Request, cookies: Cookies, userID: User['id']) {
	return;
}

export async function RefreshUserSession(prefix: number, expiry: Date) {
	return;
}

export async function UserLogout(request: Request, cookies: Cookies) {
	return;
}