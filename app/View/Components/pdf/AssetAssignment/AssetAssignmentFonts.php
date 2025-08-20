<?php

namespace App\View\Components\pdf\AssetAssignment;

use Closure;
use Illuminate\Contracts\View\View;
use Illuminate\View\Component;

class AssetAssignmentFonts extends Component
{
    /**
     * Create a new component instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Get the view / contents that represent the component.
     */
    public function render(): View|Closure|string
    {
        return view('components.pdf.asset-assignment.fonts');
    }
}
