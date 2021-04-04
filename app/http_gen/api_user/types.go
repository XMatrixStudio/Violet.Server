package api_user

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	Email     string `json:"email"`
	Password  string `json:"password"`
	Ticket    string `json:"ticket"`
	EmailCode string `json:"email_code"`
}
