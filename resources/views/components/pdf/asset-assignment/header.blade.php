<header>
    <table class="hdc">
        <tr>
            <td style="width: 60pt">Document title:</td>
            <td colspan="3">{{ $title }}</td>
            <td rowspan="4" colspan="2" class="hdc-logo-wrapper">
                <img class="hdc-logo" alt="Scanjet An Alfa Laval Brand"
                    src="{{ public_path('images/sj-logo-blue.png') }}" />
            </td>
        </tr>
        <tr>
            <td>Document code:</td>
            <td colspan="3">{{ $code }}</td>
        </tr>
        <tr>
            <td>Version:</td>
            <td style="width: 100pt">{{ $version }}</td>
            <td style="width: 60pt">Last revised:</td>
            <td>{{ $lastRevised }}</td>
        </tr>
        <tr>
            <td>Issued by:</td>
            <td style="width: 70pt">
                {{ $issuedBy }}
            </td>
            <td>Approved by:</td>
            <td>{{ $approvedBy }}</td>
        </tr>
        <tr>
            <td>Issue date:</td>
            <td>{{ $issueDate }}</td>
            <td>Approved date:</td>
            <td>{{ $approvedDate }}</td>
            <td>Page:</td>
            <td><span class="pagenum"></span><span></span></td>
        </tr>
    </table>

</header>
