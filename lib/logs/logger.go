package logs

import (
	"os"
	"path/filepath"
	"sync"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

const (
	defaultLogPath = "./log"
)

var (
	defaultLogger *zap.Logger
	once          sync.Once
)

func InitLogger(isProduct bool) {
	once.Do(func() {
		var core zapcore.Core
		if isProduct {
			core = zapcore.NewCore(getProductionEncoder(), getWriteSyncer(defaultLogPath), zapcore.InfoLevel)
		} else {
			core = zapcore.NewCore(getDevelopmentEncoder(), getWriteSyncer(defaultLogPath), zapcore.DebugLevel)
		}
		defaultLogger = zap.New(core)
		defaultLogger = defaultLogger.WithOptions(zap.AddCaller(), zap.AddCallerSkip(1))
	})
}

func Sync() {
	_ = defaultLogger.Sync()
}

func getDevelopmentEncoder() zapcore.Encoder {
	encoderConfig := zap.NewDevelopmentEncoderConfig()
	return zapcore.NewConsoleEncoder(encoderConfig)
}

func getProductionEncoder() zapcore.Encoder {
	encoderConfig := zap.NewProductionEncoderConfig()
	encoderConfig.EncodeTime = zapcore.ISO8601TimeEncoder
	return zapcore.NewJSONEncoder(encoderConfig)
}

func getWriteSyncer(logPath string) zapcore.WriteSyncer {
	// 日志目录不存在就创建相应目录
	_, err := os.Stat(logPath)
	if err != nil {
		if os.IsNotExist(err) {
			if err = os.MkdirAll(logPath, 0755); err != nil {
				StartFail(err.Error())
			}
		} else {
			StartFail(err.Error())
		}
	}

	// 创建日志文件
	file, err := os.OpenFile(filepath.Join(logPath, "violet.log"), os.O_WRONLY|os.O_APPEND|os.O_CREATE, 0644)
	if err != nil {
		StartFail(err.Error())
	}
	return zapcore.NewMultiWriteSyncer(zapcore.AddSync(file), zapcore.AddSync(os.Stdout))
}
