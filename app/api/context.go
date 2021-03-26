package api

import (
	"sync"
	"time"

	"github.com/gin-contrib/sessions"
	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

var pool = sync.Pool{
	New: func() interface{} {
		return &RequestContext{
			ctx:     nil,
			logger:  nil,
			mu:      sync.Mutex{},
			now:     time.Time{},
			session: nil,
		}
	},
}

type RequestContext struct {
	ctx     *gin.Context
	logger  *zap.Logger
	mu      sync.Mutex
	now     time.Time
	session sessions.Session
}

func NewRequestContext(c *gin.Context) *RequestContext {
	r := pool.Get().(*RequestContext)
	r.ctx = c

	logger, ok := c.Value(keyLogger).(*zap.Logger)
	if ok && logger != nil {
		r.logger = logger
	} else {
		r.logger = zap.L()
	}

	r.now = time.Now()
	r.session = sessions.Default(c)

	return r
}

func RecycleRequestParam(rp *RequestContext) {
	rp.ctx = nil
	rp.logger = nil
	rp.mu = sync.Mutex{}
	rp.now = time.Time{}
	rp.session = nil
	pool.Put(rp)
}

func (r *RequestContext) Copy() *RequestContext {
	r.mu.Lock()
	obj := pool.Get().(*RequestContext)
	obj.ctx = r.ctx.Copy()
	obj.logger = r.logger
	obj.now = r.now
	obj.session = r.session
	return obj
}

func (r *RequestContext) Ctx() *gin.Context {
	return r.ctx
}

func (r *RequestContext) Logger() *zap.Logger {
	return r.logger
}

func (r *RequestContext) Now() time.Time {
	return r.now
}

func (r *RequestContext) Session() sessions.Session {
	return r.session
}

func (r *RequestContext) OnDo(err error) Result {
	return newResult(r, nil, err)
}

func (r *RequestContext) OnError(err error) Result {
	return newResult(r, nil, err)
}

func (r *RequestContext) OnFetch(data interface{}, err error) Result {
	return newResult(r, data, err)
}
