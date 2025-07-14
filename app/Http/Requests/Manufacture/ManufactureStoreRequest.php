<?php

namespace App\Http\Requests\Manufacture;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ManufactureStoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            "name" => 'string|required|unique:manufactures,name',
            "address" => 'string|nullable',
            "phone" => 'string|nullable',
            "email" => 'string|email|nullable',
            "website" => 'string|nullable',
            "contact_person_name" => 'string|nullable',
            "contact_person_phone" => 'string|nullable',
            "contact_person_email" => 'string|email|nullable'
        ];
    }
}
