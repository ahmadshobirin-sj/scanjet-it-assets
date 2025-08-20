<?php

namespace App\View\Components\pdf\AssetAssignment;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class AssetAssignmentHeader extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct(
        public string $title = '',
        public string $code = '',
        public string $version = '',
        public string $lastRevised = '',
        public string $issuedBy = '',
        public string $approvedBy = '',
        public string $issueDate = '',
        public string $approvedDate = '',
    ) {
        //
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.pdf.asset-assignment.header');
    }
}
