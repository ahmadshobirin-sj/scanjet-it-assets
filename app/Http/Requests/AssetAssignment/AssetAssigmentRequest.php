<?php

namespace App\Http\Requests\AssetAssignment;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AssetAssigmentRequest extends FormRequest
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
            'assigned_user_id' => ['required', Rule::exists('mysql_crm.users', 'id')],
            'asset_ids' => 'required|array',
            'asset_ids.*' => 'exists:assets,id',
            'assigned_at' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
