<?php

namespace App\DTOs;

use App\Models\AssetAssignment;
use App\Models\AssetReturn;

final class AssetReturnResult
{
    public function __construct(
        public readonly AssetAssignment $assignment,
        public readonly AssetReturn $return,
    ) {}
}
