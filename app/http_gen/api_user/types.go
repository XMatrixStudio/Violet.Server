package api_user

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email         string `json:"email"`
	EmailCode     string `json:"email_code"`
	EmailTicket   string `json:"email_ticket"`
	Password      string `json:"password"`
	PasswordAgain string `json:"password_again"`
	Nickname      string `json:"nickname"`
}
