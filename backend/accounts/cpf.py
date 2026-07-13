import re


def cpf_digits(value: str) -> str:
    return re.sub(r'\D', '', value or '')


def is_valid_cpf(value: str) -> bool:
    digits = cpf_digits(value)
    if len(digits) != 11 or digits == digits[0] * 11:
        return False

    def check_digit(base: str, factor: int) -> str:
        total = sum(int(digit) * (factor - index) for index, digit in enumerate(base))
        remainder = (total * 10) % 11
        return '0' if remainder == 10 else str(remainder)

    if check_digit(digits[:9], 10) != digits[9]:
        return False
    if check_digit(digits[:10], 11) != digits[10]:
        return False
    return True


def format_cpf(value: str) -> str:
    digits = cpf_digits(value)
    if len(digits) != 11:
        return value or ''
    return f'{digits[:3]}.{digits[3:6]}.{digits[6:9]}-{digits[9:]}'


def normalize_cpf(value: str) -> str:
    if not is_valid_cpf(value):
        raise ValueError('CPF inválido.')
    return format_cpf(value)
