from typing import List, Dict
import traceback
import sys
from colorama import Fore, Style, init

# Initialize colorama for cross-platform color support
init()

def format_stack_frame(filename: str, line: int, function: str, code: str) -> Dict[str, str]:
    return {
        "filename": filename,
        "line": str(line),
        "function": function,
        "code": code.strip() if code else ""
    }

def get_formatted_traceback() -> List[Dict[str, str]]:
    exc_type, exc_value, exc_traceback = sys.exc_info()
    stack_frames = []
    
    for frame in traceback.extract_tb(exc_traceback):
        stack_frames.append(format_stack_frame(
            filename=frame.filename,
            line=frame.lineno,
            function=frame.name,
            code=frame.line
        ))
    
    return stack_frames

def format_error_message(exc: Exception, stack_frames: List[Dict[str, str]]) -> str:
    formatted_error = [
        f"\n{Fore.RED}{'=' * 80}{Style.RESET_ALL}",
        f"{Fore.RED}ERROR TYPE: {Style.BRIGHT}{exc.__class__.__name__}{Style.RESET_ALL}",
        f"{Fore.RED}MESSAGE: {Style.BRIGHT}{str(exc)}{Style.RESET_ALL}",
        f"{Fore.RED}{'=' * 80}{Style.RESET_ALL}\n",
        f"{Fore.YELLOW}Stack Trace:{Style.RESET_ALL}\n"
    ]

    for i, frame in enumerate(reversed(stack_frames), 1):
        formatted_error.extend([
            f"{Fore.CYAN}[{i}] {Style.BRIGHT}{frame['filename']}{Style.RESET_ALL}",
            f"    {Fore.GREEN}Line {frame['line']} in {frame['function']}{Style.RESET_ALL}",
            f"    {Fore.WHITE}{frame['code']}{Style.RESET_ALL}",
            ""
        ])

    formatted_error.append(f"{Fore.RED}{'=' * 80}{Style.RESET_ALL}")
    return "\n".join(formatted_error)
