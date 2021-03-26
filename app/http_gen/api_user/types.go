package api_user

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}
