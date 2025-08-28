<?php

namespace App\Http\Requests\Asset;

use App\Enums\AssetStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class AssetUpdateRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'category_id' => 'required|string|exists:asset_categories,id',
            'manufacture_id' => 'required|string|exists:manufactures,id',
            'location' => 'required|string|max:255',
            'serial_number' => ['string', 'nullable', 'max:255', Rule::unique('assets')->ignore($this->asset)],
            'warranty_expired' => 'date|nullable',
            'purchase_date' => 'date|nullable',
            'note' => 'string|nullable',
            'reference_link' => 'string|nullable|max:255',
            'status' => ['required', 'string',  new Enum(AssetStatus::class)],
            'po_attachments' => ['required', 'array'],
            'po_attachments.*' => ['integer', 'distinct'],
        ];
    }
}
