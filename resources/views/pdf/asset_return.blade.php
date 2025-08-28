@php
    $opHasSigned = !empty($data['returned_at']);
    $returned_at = null;
    if ($opHasSigned) {
        $returned_at = \Carbon\Carbon::parse($data['returned_at'])->format('d F Y');
    }
@endphp
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>IT Hardware Asset Return Form</title>
    <link rel="stylesheet" type="text/css" href="{{ public_path('css/asset-assignment-pdf.css') }}">
    <x-pdf.asset-assignment.fonts />
</head>

<body>
    {{-- Page 1 --}}
    <x-pdf.asset-assignment.header :title="$header['title']" :code="$header['code']" :version="$header['version']" :last_revised="$header['last_revised']"
        :issued_by="$header['issued_by']" :approved_by="$header['approved_by']" :issue_date="$header['issue_date']" :approved_date="$header['approved_date']" />
    <main>
        <h1 class="pg-title">IT Hardware Asset Return Form</h1>

        <div class="pg-section">
            <p class="pg-section-title">Purpose:</p>
            <p class="pg-section-desc">
                This form documents the Return of IT hardware assets in accordance with
                {{ $header['company_name'] }}'s IT Hardware Asset Management Policy.<br />
                It ensures proper asset tracking, verifies asset condition upon return, and maintains accountability
                throughout the hardware lifecycle
            </p>
        </div>

        <div class="pg-section">
            <p class="pg-section-title">
                Section 1: User Information
            </p>
            <table class="tb-full tb-ui">
                <tr>
                    <td style="width: 150px">User Name</td>
                    <td>
                        {{ $data['assignment']['assigned_user']['name'] }}
                    </td>
                </tr>
                <tr>
                    <td>Department</td>
                    <td>-</td>
                </tr>
                <tr>
                    <td>Email <small style="font-style: italic">(@scanjet.net)</small></td>
                    <td>{{ $data['assignment']['assigned_user']['email'] }}</td>
                </tr>
            </table>
        </div>

        <div class="pg-section">
            <p class="pg-section-title">
                Section 2: Assignment Reference Code Identification
            </p>
            <table class="tb-full tb-rf">
                <tr>
                    <td style="width: 150px">
                        Assignment Ref. Code
                    </td>
                    <td>
                        {{ $data['assignment']['reference_code'] }}
                    </td>
                </tr>
            </table>
        </div>

        <div class="pg-section">
            <p class="pg-section-title">
                Section 3: Returned Asset Details <i style="font-weight: 400">(Assessed by IT Dept./HR/Site Manager)</i>
            </p>
            <table class="tb-full tb-art">
                <thead>
                    <tr>
                        <th>Asset Type</th>
                        <th>Condition</th>
                    </tr>
                </thead>
                <tbody>
                    @foreach ($data['assets'] as $asset)
                        <tr>
                            <td style="width: 150pt;">{{ $asset['category']['name'] }}</td>
                            <td>
                                {{ \App\Enums\AssetAssignmentAssetCondition::from($asset['pivot']['condition'])->label() }}
                            </td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
            <div class="w-full">
                <p>Notes:</p>
                <div class="notes-input">
                    {{ $data['notes'] }}
                </div>
            </div>
        </div>

        {{-- <div class="page-break"></div> --}}

        <div class="pg-section">
            <p class="pg-section-title">
                Section 4: Received By IT Dept. / HR / Site Manager
            </p>
            <table class="tb-full tb-ui">
                <tr>
                    <td style="width: 150px">Name</td>
                    <td>{{ $data['received_by']['name'] }}</td>
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
                        @if ($opHasSigned)
                            Digitally signed by {{ $data['received_by']['name'] }}
                        @endif
                    </td>
                    <td rowspan="3"></td>
                    <td class="tb-signature-cell tb-signature-input">
                        {{-- Date --}}
                        {{ $returned_at }}
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
