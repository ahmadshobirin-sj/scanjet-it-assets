<?php

namespace App\Http\Requests\AssetCategory;

use Illuminate\Foundation\Http\FormRequest;

class AssetCategoryStoreRequest extends FormRequest
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
            'name' => 'string|required|unique:asset_categories,name',
            'description' => 'nullable|string|max:255',
        ];
    }
}
