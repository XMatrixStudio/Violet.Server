package api

import (
	"context"
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
			now:     time.Time{},
			session: nil,
		}
	},
}

type RequestContext struct {
	ctx     *gin.Context
	logger  *zap.Logger
	now     time.Time
	session sessions.Session
}

func NewRequestContext(c *gin.Context, handlerName string) *RequestContext {
	// 从gin.Context中获取需要的数据
	logger, ok := c.Value(keyLogger).(*zap.Logger)
	if !ok || logger == nil {
		logger = zap.L()
	}
	logger = logger.With(zap.String(keyHandler, handlerName))

	// 更新gin.Context
	c.Set(keyHandler, handlerName)
	c.Set(keyLogger, logger)

	// 构建RequestContext
	r := pool.Get().(*RequestContext)
	r.ctx = c
	r.logger = logger
	r.now = time.Now()
	r.session = sessions.Default(c)

	return r
}

func RecycleRequestContext(rp *RequestContext) {
	rp.ctx = nil
	rp.logger = nil
	rp.now = time.Time{}
	rp.session = nil
	pool.Put(rp)
}

func (r *RequestContext) Copy() *RequestContext {
	obj := pool.Get().(*RequestContext)
	obj.ctx = r.ctx.Copy()
	obj.logger = r.logger
	obj.now = r.now
	obj.session = r.session
	return obj
}

func (r *RequestContext) Ctx() context.Context {
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
