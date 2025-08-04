<?php

namespace App\Exceptions;

use Exception;

class ClientException extends Exception
{
    public function __construct(
        string $message = 'Client Error',
        protected ?string $description = null,
        int $code = 400,
        ?\Throwable $previous = null
    ) {
        parent::__construct($message, $code, $previous);
    }

    public function getDescription(): ?string
    {
        return $this->description;
    }
}
