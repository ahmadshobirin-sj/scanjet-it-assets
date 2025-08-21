<?php

namespace App\Tables\Enums;

/**
 * AdvanceOperator
 * ----------------
 * Kumpulan operator generik untuk filter/sort/where yang dipakai
 * di berbagai FilterColumn dan AdvancedFilter engine.
 */
enum AdvanceOperator: string
{
    case EQUALS = 'equals';
    case NOT_EQUALS = 'not_equals';
    case CONTAINS = 'contains';
    case NOT_CONTAINS = 'not_contains';
    case STARTS_WITH = 'starts_with';
    case ENDS_WITH = 'ends_with';
    case GREATER_THAN = 'greater_than';
    case GREATER_THAN_OR_EQUAL = 'greater_than_or_equal';
    case LESS_THAN = 'less_than';
    case LESS_THAN_OR_EQUAL = 'less_than_or_equal';
    case BETWEEN = 'between';
    case NOT_BETWEEN = 'not_between';
    case IN = 'in';
    case NOT_IN = 'not_in';
    case IS_NULL = 'is_null';
    case IS_NOT_NULL = 'is_not_null';
    case IS_TRUE = 'is_true';
    case IS_FALSE = 'is_false';

    // Date-specific aliases
    case BEFORE = 'before';
    case AFTER = 'after';
    case EQUAL_OR_BEFORE = 'equal_or_before';
    case EQUAL_OR_AFTER = 'equal_or_after';

    // Presence aliases (umum dipakai untuk nullable field)
    case IS_SET = 'is_set';
    case IS_NOT_SET = 'is_not_set';

    /** Label manusiawi untuk FE */
    public function label(): string
    {
        return match ($this) {
            self::EQUALS => 'Equals',
            self::NOT_EQUALS => 'Not Equals',
            self::CONTAINS => 'Contains',
            self::NOT_CONTAINS => 'Not Contains',
            self::STARTS_WITH => 'Starts With',
            self::ENDS_WITH => 'Ends With',
            self::GREATER_THAN => 'Greater Than',
            self::GREATER_THAN_OR_EQUAL => 'Greater Than or Equal',
            self::LESS_THAN => 'Less Than',
            self::LESS_THAN_OR_EQUAL => 'Less Than or Equal',
            self::BETWEEN => 'Between',
            self::NOT_BETWEEN => 'Not Between',
            self::IN => 'In',
            self::NOT_IN => 'Not In',
            self::IS_NULL => 'Is Null',
            self::IS_NOT_NULL => 'Is Not Null',
            self::IS_TRUE => 'Is True',
            self::IS_FALSE => 'Is False',
            self::BEFORE => 'Before',
            self::AFTER => 'After',
            self::EQUAL_OR_BEFORE => 'Equal or Before',
            self::EQUAL_OR_AFTER => 'Equal or After',
            self::IS_SET => 'Is Set',
            self::IS_NOT_SET => 'Is Not Set',
        };
    }

    /** Operator SQL ekuivalen (untuk komparasi dasar) */
    public function toSqlOperator(): string
    {
        return match ($this) {
            self::EQUALS => '=',
            self::NOT_EQUALS => '!=',
            self::GREATER_THAN, self::AFTER => '>',
            self::GREATER_THAN_OR_EQUAL, self::EQUAL_OR_AFTER => '>=',
            self::LESS_THAN, self::BEFORE => '<',
            self::LESS_THAN_OR_EQUAL, self::EQUAL_OR_BEFORE => '<=',
            default => throw new \LogicException("Operator {$this->value} cannot be converted to SQL operator directly"),
        };
    }

    /** Apakah operator butuh nilai? */
    public function requiresValue(): bool
    {
        return ! in_array($this, [
            self::IS_NULL,
            self::IS_NOT_NULL,
            self::IS_SET,
            self::IS_NOT_SET,
        ], true);
    }

    /** Apakah operator butuh array nilai? (BETWEEN/IN dsb.) */
    public function requiresArrayValue(): bool
    {
        return in_array($this, [
            self::BETWEEN,
            self::NOT_BETWEEN,
            self::IN,
            self::NOT_IN,
        ], true);
    }

    /** Kelompok operator untuk text */
    public static function textOperators(): array
    {
        return [
            self::CONTAINS,
            self::NOT_CONTAINS,
            self::STARTS_WITH,
            self::ENDS_WITH,
            self::EQUALS,
            self::NOT_EQUALS,
        ];
    }

    /** Kelompok operator untuk angka */
    public static function numericOperators(): array
    {
        return [
            self::EQUALS,
            self::NOT_EQUALS,
            self::GREATER_THAN,
            self::GREATER_THAN_OR_EQUAL,
            self::LESS_THAN,
            self::LESS_THAN_OR_EQUAL,
            self::BETWEEN,
            self::NOT_BETWEEN,
        ];
    }

    /** Kelompok operator untuk tanggal */
    public static function dateOperators(): array
    {
        return [
            self::EQUALS,
            self::NOT_EQUALS,
            self::BEFORE,
            self::AFTER,
            self::EQUAL_OR_BEFORE,
            self::EQUAL_OR_AFTER,
            self::BETWEEN,
            self::NOT_BETWEEN,
            self::IS_SET,
            self::IS_NOT_SET,
        ];
    }

    /** Kelompok operator untuk select/set */
    public static function selectOperators(): array
    {
        return [
            self::EQUALS,
            self::NOT_EQUALS,
            self::IN,
            self::NOT_IN,
        ];
    }

    /** Kelompok operator untuk boolean */
    public static function booleanOperators(): array
    {
        return [
            self::IS_TRUE,
            self::IS_FALSE,
        ];
    }

    /** Opsi untuk FE (value+label) */
    public static function options(): array
    {
        return array_map(
            fn ($case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
