<?php

namespace App\Http\Services;

use App\Models\MsGraphToken;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Schema;

class MsGraphTokenService extends Service
{
    public function attributes(): array
    {
        return Schema::getColumnListing((new MsGraphToken)->getTable());
    }

    public function create(array $data)
    {
        $msgraphToken = MsGraphToken::updateOrCreate(Arr::only($data, 'user_id'), $data);

        return $msgraphToken;
    }
}
