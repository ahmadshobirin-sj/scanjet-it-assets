<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Dcblogdev\MsGraph\Facades\MsGraph;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function login(Request $request): Response
    {
        return Inertia::render('auth/login');
    }

    public function connect()
    {
        return MsGraph::connect();
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        MsGraph::disconnect();

        return redirect()->route('login');
    }
}
