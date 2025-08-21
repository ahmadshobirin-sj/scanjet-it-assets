@php
    $userHasSigned = !empty($assignment['confirmed_at']);
    $confirmed_at = null;
    if ($userHasSigned) {
        $confirmed_at = \Carbon\Carbon::parse($assignment['confirmed_at'])->format('d F Y');
    }
@endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>IT Hardware Asset Assignment Form</title>
    <link rel="stylesheet" type="text/css" href="{{ public_path('css/asset-assignment-pdf.css') }}">
    <x-pdf.asset-assignment.fonts />
</head>

<body>
    {{-- Page 1 --}}
    <x-pdf.asset-assignment.header :title="$header['title']" :code="$header['code']" :version="$header['version']" :last_revised="$header['last_revised']"
        :issued_by="$header['issued_by']" :approved_by="$header['approved_by']" :issue_date="$header['issue_date']" :approved_date="$header['approved_date']" />
    <main>
        <h1 class="pg-title">IT Hardware Asset Assignment Form</h1>

        <div class="pg-section">
            <p class="pg-section-title">Purpose:</p>
            <p class="pg-section-desc">
                This form documents the Deployment or Reassignment of IT hardware assets in accordance with
                {{ $header['company_name'] }}'s IT Hardware Management Policy. It ensures traceability, asset
                accountability, and
                lifecycle
                tracking.
            </p>
        </div>

        {{-- <div class="pg-section">
            <p class="pg-section-title">Section 1: Assignment Type (Select One)</p>
            <div class="pg-select">
                <div class="pg-select-it">
                    <div class="pg-select-box"></div>
                    <div class="pg-select-desc">Deployment (First-time assignment)</div>
                </div>
                <div class="pg-select-it">
                    <div class="pg-select-box"></div>
                    <div class="pg-select-desc">Reassignment (Replacement or Transfer to New User)</div>
                </div>
            </div>
        </div> --}}

        <div class="pg-section">
            <p class="pg-section-title">
                Section 2: Assignment Reference Code Identification
            </p>
            <table class="tb-full tb-medium">
                <tr>
                    <td style="width: 100px">
                        Ref. Code
                    </td>
                    <td>
                        {{ $assignment['reference_code'] }}
                    </td>
                </tr>
            </table>
        </div>

        <div class="pg-section">
            <p class="pg-section-title">
                Section 3: Asset Information
            </p>
            <table class="tb-full">
                <thead>
                    <tr>
                        <th style="width: 40pt">Asset Type</th>
                        <th>Asset Name</th>
                        <th>Serial Number</th>
                        <th>Asset Tag</th>
                        <th style="width: 40pt">Assigment Type</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($assignment['assets'] as $asset)
                        <tr>
                            <td>{{ $asset['category']['name'] }}</td>
                            <td>{{ $asset['name'] }}</td>
                            <td>{{ $asset['serial_number'] }}</td>
                            <td>{{ $asset['asset_tag'] }}</td>
                            @if ($asset['assigned_before_this'])
                                <td>{{ 'Reassignment' }}</td>
                            @else
                                <td>{{ 'Deployment' }}</td>
                            @endif
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </div>

        <div class="page-break"></div>

        <div class="pg-section">
            <p class="pg-section-title">
                Section 4: User Acknowledgment
            </p>
            <table class="tb-full">
                <tr>
                    <td style="width: 150px">User Name</td>
                    <td>
                        {{ $assignment['assigned_user']['name'] }}
                    </td>
                </tr>
                <tr>
                    <td>Department</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Email <small style="font-style: italic">(@scanjet.net)</small></td>
                    <td>{{ $assignment['assigned_user']['email'] }}</td>
                </tr>
            </table>
        </div>

        <div class="pg-section">
            <p>By signing this form, I acknowledge and agree to the following:</p>
            <ol style="margin: 0;" class="number-bracket">
                <li>The hardware assigned to me is the property of {{ $header['company_name'] }}.</li>
                <li>I will exercise reasonable care in using, storing, and transporting the hardware.</li>
                <li>I will not loan the hardware to other individuals without IT Department approval.</li>
                <li>I will use the hardware only for authorized business purposes unless permitted otherwise by [Company
                    Name]'s policies.</li>
                <li>I will immediately report any loss, theft, damage, or malfunction to the IT Department.</li>
                <li>I understand I may be held accountable for the return of the hardware in good condition, except for
                    normal wear and tear.</li>
                <li>Upon employment termination, reassignment, or when requested by {{ $header['company_name'] }}, I
                    will return all
                    assigned hardware promptly.</li>
                <li>I will not attempt to repair the device myself or use unauthorized service providers.</li>
                <li>Failure to return the equipment may result in financial recovery actions, including payroll
                    deduction or
                    legal action as per {{ $header['company_name'] }} policy.</li>
            </ol>
        </div>

        <div class="pg-section" style="margin-top: 18pt">
            <table class="tb-full tb-border-none tb-padding-none tb-signature">
                <tr>
                    <td class="tb-signature-cell tb-signature-input">
                        {{-- User Signature --}}
                        @if ($userHasSigned)
                            Digitally signed by {{ $assignment['assigned_user']['name'] }}
                        @endif
                    </td>
                    <td rowspan="3"></td>
                    <td class="tb-signature-cell tb-signature-input">
                        {{-- Date --}}
                        {{ $confirmed_at }}
                    </td>
                </tr>
                <tr>
                    <td class="tb-signature-cell tb-signature-line">
                        <div class="sig-line"></div>
                    </td>
                    <td class="tb-signature-cell tb-signature-line">
                        <div class="sig-line"></div>
                    </td>
                </tr>
                <tr>
                    <td class="tb-signature-cell tb-signature-desc">
                        User Signature
                    </td>
                    <td class="tb-signature-cell tb-signature-desc">
                        Date
                    </td>
                </tr>
            </table>
        </div>

        <div class="pg-section">
            <p class="pg-section-title">
                Section 5: Assignment Performed By
            </p>
            <table class="tb-full">
                <tr>
                    <td style="width: 150px">Name</td>
                    <td>{{ $assignment['assigned_by']['name'] }}</td>
                </tr>
                <tr>
                    <td>Department</td>
                    <td>-</td>
                </tr>
            </table>
        </div>

        <div class="pg-section" style="margin-top: 30pt">
            <table class="tb-full tb-border-none tb-padding-none tb-signature">
                <tr>
                    <td class="tb-signature-cell tb-signature-input">
                        {{-- Signature --}}
                        @if ($userHasSigned)
                            Digitally signed by {{ $assignment['assigned_by']['name'] }}
                        @endif
                    </td>
                    <td rowspan="3"></td>
                    <td class="tb-signature-cell tb-signature-input">
                        {{-- Date --}}
                        {{ $confirmed_at }}
                    </td>
                </tr>
                <tr>
                    <td class="tb-signature-cell tb-signature-line">
                        <div class="sig-line"></div>
                    </td>
                    <td class="tb-signature-cell tb-signature-line">
                        <div class="sig-line"></div>
                    </td>
                </tr>
                <tr>
                    <td class="tb-signature-cell tb-signature-desc">
                        Signature
                    </td>
                    <td class="tb-signature-cell tb-signature-desc">
                        Date
                    </td>
                </tr>
            </table>
        </div>
    </main>
</body>

</html>
