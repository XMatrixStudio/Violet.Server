package result

import (
	"sync"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
)

var paramPool = sync.Pool{
	New: func() interface{} {
		return &RequestParam{
			ctx:     nil,
			copyCtx: nil,
			copyMu:  sync.Mutex{},
			session: nil,
			now:     time.Time{},
		}
	},
}

type RequestParam struct {
	ctx     *gin.Context
	copyCtx *gin.Context
	copyMu  sync.Mutex
	session sessions.Session
	now     time.Time
}

func NewRequestParam(c *gin.Context) *RequestParam {
	rp := paramPool.Get().(*RequestParam)
	rp.ctx = c
	rp.session = sessions.Default(c)
	rp.now = time.Now()
	return rp
}

func RecycleRequestParam(rp *RequestParam) {
	rp.ctx = nil
	rp.copyCtx = nil
	rp.session = nil
	rp.now = time.Time{}
	paramPool.Put(rp)
}

func (rp *RequestParam) Ctx() *gin.Context {
	return rp.ctx
}

func (rp *RequestParam) CopyCtx() *gin.Context {
	if rp.copyCtx == nil {
		rp.copyMu.Lock()
		if rp.copyCtx == nil {
			rp.copyCtx = rp.ctx.Copy()
		}
		rp.copyMu.Unlock()
	}
	return rp.copyCtx
}

func (rp *RequestParam) Now() time.Time {
	return rp.now
}

func (rp *RequestParam) Session() sessions.Session {
	return rp.session
}
