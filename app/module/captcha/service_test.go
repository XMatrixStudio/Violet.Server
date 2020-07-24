package captcha

import (
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/xmatrixstudio/violet.server/app/config"
)

func TestService_GetCaptcha(t *testing.T) {
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	service := &Service{Cap: config.NewCaptcha()}
	service.GetCaptcha(ctx, "register", 0)
}
