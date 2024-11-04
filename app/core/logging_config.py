import logging.config
import sys
from pathlib import Path
from pythonjsonlogger import jsonlogger
from datetime import datetime

# Create logs directory if it doesn't exist
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

class CustomJsonFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record, record, message_dict):
        super(CustomJsonFormatter, self).add_fields(log_record, record, message_dict)
        if not log_record.get('timestamp'):
            log_record['timestamp'] = record.created
        if log_record.get('level'):
            log_record['level'] = log_record['level'].upper()
        else:
            log_record['level'] = record.levelname

class ColoredConsoleFormatter(logging.Formatter):
    """Custom formatter with colors for console output"""
    
    grey = "\x1b[38;21m"
    blue = "\x1b[38;5;39m"
    yellow = "\x1b[38;5;226m"
    red = "\x1b[38;5;196m"
    bold_red = "\x1b[31;1m"
    reset = "\x1b[0m"

    COLORS = {
        'DEBUG': grey,
        'INFO': blue,
        'WARNING': yellow,
        'ERROR': red,
        'CRITICAL': bold_red,
    }

    def format(self, record):
        # Format the message first
        record.msg = super().format(record)
        
        if not record.exc_info:
            level_color = self.COLORS.get(record.levelname, self.grey)
            record.levelname = f"{level_color}{record.levelname:<8}{self.reset}"
            
            # Format timestamp
            dt = datetime.fromtimestamp(record.created)
            record.asctime = dt.strftime('%Y-%m-%d %H:%M:%S')
            
            # Add request details if available
            request_details = []
            for attr in ['method', 'url', 'status_code', 'process_time']:
                if hasattr(record, attr) and getattr(record, attr) is not None:
                    request_details.append(f"{attr}={getattr(record, attr)}")
            
            if request_details:
                record.msg = f"{record.msg} ({', '.join(request_details)})"
        
        # Return the final formatted string
        return f"{record.asctime} - {record.levelname} - {record.name} - {record.msg}"

LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {
            "()": CustomJsonFormatter,
            "format": "%(timestamp)s %(level)s %(name)s %(message)s %(request_id)s %(method)s %(url)s %(status_code)s %(process_time)s %(type)s"
        },
        "colored_console": {
            "()": ColoredConsoleFormatter,
            "format": "%(asctime)s - %(levelname)s - %(name)s - %(message)s",
            "datefmt": "%Y-%m-%d %H:%M:%S",
        }
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "stream": sys.stdout,
            "formatter": "colored_console",
            "level": "INFO",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "logs/app.log",
            "maxBytes": 10485760,  # 10MB
            "backupCount": 5,
            "formatter": "json",
            "level": "INFO",
        },
    },
    "loggers": {
        "app": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": False,
        },
    },
    "root": {
        "handlers": ["console", "file"],
        "level": "INFO",
    },
}

def setup_logging():
    logging.config.dictConfig(LOGGING_CONFIG) 