<?php

namespace App\DTOs;

final class MsGraphUserDTO
{
    public function __construct(
        public string $msgraph_user_id,
        public string $user_principal_name,
        public string $name,
        public string $email,
        public ?string $preferred_language,
        /** @var string[] */
        public array $business_phones,
        public ?string $given_name,
        public ?string $job_title,
        public ?string $mobile_phone,
        public ?string $office_location,
        public ?string $surname,
        public ?string $department,
        public ?string $manager_email,
    ) {}

    public static function fromGraph(array $u): self
    {
        $email = $u['mail'] ?? $u['userPrincipalName'] ?? '';
        $name = $u['displayName']
            ?? trim(($u['givenName'] ?? '').' '.($u['surname'] ?? ''))
            ?: $email;

        return new self(
            msgraph_user_id: $u['id'],
            user_principal_name: $u['userPrincipalName'] ?? '',
            email: $email,
            preferred_language: $u['preferredLanguage'] ?? null,
            business_phones: array_values($u['businessPhones'] ?? []),
            given_name: $u['givenName'] ?? null,
            job_title: $u['jobTitle'] ?? null,
            mobile_phone: $u['mobilePhone'] ?? null,
            office_location: $u['officeLocation'] ?? null,
            surname: $u['surname'] ?? null,
            name: $name,
            department: $u['department'] ?? null,
            manager_email: $u['manager'] ? $u['manager']['mail'] ?? null : null
        );
    }

    public function toArray(): array
    {
        return [
            'msgraph_user_id' => $this->msgraph_user_id,
            'user_principal_name' => $this->user_principal_name,
            'email' => $this->email,
            'preferred_language' => $this->preferred_language,
            'business_phones' => $this->business_phones,
            'given_name' => $this->given_name,
            'job_title' => $this->job_title,
            'mobile_phone' => $this->mobile_phone,
            'office_location' => $this->office_location,
            'surname' => $this->surname,
            'name' => $this->name,
            'department' => $this->department,
            'manager_email' => $this->manager_email,
        ];
    }
}
