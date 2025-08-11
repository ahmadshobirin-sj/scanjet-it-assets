<?php

namespace App\Http\Requests\AssetReturn;

use App\Enums\AssetAssignmentAssetCondition;
use Illuminate\Foundation\Http\FormRequest;

class AssetReturnStoreRequest extends FormRequest
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
            'assets' => 'required|array',
            'assets.*.asset_id' => 'required|exists:assets,id',
            'assets.*.condition' => 'required|in:'.implode(',', array_column(AssetAssignmentAssetCondition::cases(), 'value')),
            'returned_at' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
