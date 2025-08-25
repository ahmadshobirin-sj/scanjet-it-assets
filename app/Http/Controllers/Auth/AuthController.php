<?php

namespace App\Http\Controllers\Auth;

use App\DTOs\MsGraphUserDTO;
use App\Http\Controllers\Controller;
use App\Http\Integrations\MsGraph\MsGraphConnector;
use App\Http\Services\MsGraphTokenService;
use App\Http\Services\UserService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    private MsGraphConnector $connector;

    private $config = [];

    public function __construct()
    {
        $this->connector = new MsGraphConnector;
        $this->config = config('services.msgraph');
    }

    public function authorize(): RedirectResponse
    {
        return redirect($this->connector->getAuthorizationUrl());
    }

    public function redirectUri(Request $request): RedirectResponse
    {
        DB::beginTransaction();
        try {
            $authorizeCode = $request->input('code');

            $authenticator = $this->connector->getAccessToken($authorizeCode);

            $this->connector->authenticate($authenticator);

            $getUserResponse = $this->connector->getUser($authenticator);

            if ($getUserResponse->failed()) {
                return redirect('login')->withErrorsFlash('ERR#1: Failed to fetch user data. Please try again or contact IT for support.');
            }

            $msgraphUser = $getUserResponse->json();

            $userData = MsGraphUserDTO::fromGraph($msgraphUser)->toArray();

            $userService = new UserService;
            $user = $userService->updateOrCreate($userData);

            if ($user->roles->isEmpty()) {
                $user->assignRole($user->email === config('services.administrator.email') ? 'Super Admin' : 'Inactive');
            }

            $msGraphTokenData = [
                'user_id' => $user->id,
                'access_token' => $authenticator->getAccessToken(),
                'refresh_token' => $authenticator->getRefreshToken(),
                'expired_at' => $authenticator->getExpiresAt(),
            ];

            $msGraphTokenServerice = new MsGraphTokenService;
            $msGraphTokenServerice->create($msGraphTokenData);

            DB::commit();

            Auth::login($user);
        } catch (\Exception $e) {
            DB::rollBack();

            redirect('login')->withErrorsFlash('ERR#3: Failed to store user data. Please try again or contact IT for support.');
        }

        return redirect($this->config['landing_endpoint']);
    }

    public function login(Request $request): Response
    {
        return Inertia::render('auth/login');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        return redirect()->route('login');
    }
}
