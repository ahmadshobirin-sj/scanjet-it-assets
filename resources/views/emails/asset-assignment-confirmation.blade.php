<!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Asset Assignment Notification</title>
    <!--[if mso]>
    <noscript>
        <xml>
            <o:OfficeDocumentSettings>
                <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
        </xml>
    </noscript>
    <![endif]-->
    <style type="text/css">
        /* Reset styles */
        body,
        table,
        td,
        p,
        a,
        li,
        blockquote {
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }

        table,
        td {
            mso-table-lspace: 0pt;
            mso-table-rspace: 0pt;
        }

        img {
            -ms-interpolation-mode: bicubic;
            border: 0;
            height: auto;
            line-height: 100%;
            outline: none;
            text-decoration: none;
        }

        /* Main styles */
        body {
            margin: 0;
            padding: 0;
            background-color: #f9fafb;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 16px;
            line-height: 1.6;
            color: #3F3F3F;
        }

        .email-container {
            width: 800px;
            margin: 0 auto;
            background-color: #ffffff;
        }

        .header-table {
            background-color: #004165;
            width: 100%;
        }

        .header-content {
            padding: 30px 20px;
            text-align: center;
        }

        .header-title {
            margin: 0 0 5px 0;
            font-size: 28px;
            font-weight: 700;
            color: #ffffff;
            line-height: 1.2;
        }

        .header-subtitle {
            margin: 0;
            font-size: 16px;
            color: #ffffff;
            font-weight: 400;
        }

        .content-wrapper {
            padding: 25px;
        }

        .section-table {
            width: 100%;
            margin-bottom: 15px;
            border: 1px solid #e5e7eb;
        }

        .section-header {
            background-color: #f9fafb;
            padding: 18px 20px;
            border-bottom: 1px solid #e5e7eb;
        }

        .section-title {
            margin: 0;
            font-size: 18px;
            font-weight: 700;
            color: #3F3F3F;
        }

        .section-content {
            padding: 20px;
            background-color: #ffffff;
        }

        .info-table {
            width: 100%;
            border-collapse: collapse;
        }

        .info-row {
            border-bottom: 1px solid #f3f4f6;
        }

        .info-label {
            padding: 8px 0;
            font-size: 12px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 1px;
            width: 30%;
            vertical-align: top;
        }

        .info-value {
            padding: 8px 0;
            font-size: 16px;
            color: #3F3F3F;
            font-weight: 500;
        }

        .badge {
            padding: 4px 8px;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
            background-color: #F4D35E;
            color: #3F3F3F;
        }

        .asset-card {
            width: 100%;
            border: 1px solid #e5e7eb;
            margin-bottom: 10px;
        }

        .asset-header {
            background-color: #f9fafb;
            padding: 15px;
            border-bottom: 1px solid #e5e7eb;
        }

        .asset-title-table {
            width: 100%;
        }

        .asset-name {
            font-size: 18px;
            font-weight: 700;
            color: #3F3F3F;
            margin: 0;
        }

        .asset-details {
            padding: 15px;
            background-color: #ffffff;
        }

        .detail-table {
            width: 100%;
            border-collapse: collapse;
        }

        .detail-row {
            border-bottom: 1px solid #f3f4f6;
        }

        .detail-label {
            padding: 8px 0;
            font-size: 12px;
            font-weight: 700;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            width: 35%;
        }

        .detail-value {
            padding: 8px 0 8px 10px;
            font-size: 14px;
            color: #3F3F3F;
            font-weight: 500;
        }

        .confirmation-section {
            background-color: #f9fafb;
            border: 1px solid #3f3f3f;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }

        .confirmation-text {
            color: #374151;
            margin-bottom: 15px;
            font-size: 16px;
            font-weight: 500;
            line-height: 1.5;
        }

        .confirm-button {
            display: inline-block;
            background-color: #004165;
            color: #ffffff;
            padding: 12px 24px;
            text-decoration: none;
            border: none;
            font-weight: 700;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }

        .footer-section {
            background-color: #f9fafb;
            padding: 20px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }

        .footer-text {
            margin: 0 0 5px 0;
            color: #6b7280;
            font-size: 14px;
            line-height: 1.5;
        }

        .divider {
            height: 1px;
            background-color: #e5e7eb;
            margin: 15px 0;
        }

        /* Tablet responsive */
        @media only screen and (max-width: 768px) {
            .email-container {
                width: 94%;
                margin: 0 3%;
            }

            .header-content {
                padding: 25px 15px;
            }

            .content-wrapper {
                padding: 20px;
            }

            .section-header {
                padding: 15px;
            }

            .section-content {
                padding: 18px;
            }
        }

        /* Mobile responsive */
        @media only screen and (max-width: 480px) {
            .email-container {
                width: 100%;
                margin: 0;
            }

            .header-content {
                padding: 20px 15px;
            }

            .header-title {
                font-size: 24px;
                margin: 0 0 8px 0;
            }

            .header-subtitle {
                font-size: 14px;
            }

            .content-wrapper {
                padding: 15px;
            }

            .section-table {
                margin-bottom: 12px;
            }

            .section-header {
                padding: 12px 15px;
            }

            .section-title {
                font-size: 16px;
            }

            .section-content {
                padding: 15px;
            }

            .asset-header,
            .asset-details {
                padding: 12px;
            }

            .asset-name {
                font-size: 16px;
            }

            .confirmation-section {
                padding: 15px;
                margin: 15px 0;
            }

            .confirmation-text {
                font-size: 14px;
                margin-bottom: 12px;
            }

            .confirm-button {
                padding: 10px 20px;
                font-size: 14px;
            }

            .info-label,
            .detail-label {
                width: 100%;
                display: block;
                padding-bottom: 3px;
                font-size: 11px;
            }

            .info-value,
            .detail-value {
                width: 100%;
                display: block;
                padding-left: 0;
                padding-top: 0;
                padding-bottom: 10px;
                font-size: 15px;
            }

            .badge {
                font-size: 11px;
                padding: 3px 6px;
            }

            .footer-section {
                padding: 15px;
            }

            .footer-text {
                font-size: 12px;
            }
        }

        /* Very small mobile responsive */
        @media only screen and (max-width: 320px) {
            .header-title {
                font-size: 20px;
            }

            .confirm-button {
                padding: 8px 16px;
                font-size: 12px;
            }
        }

        /* Outlook specific */
        < !--[if mso]>.header-table {
            width: 800px;
        }

        < ![endif]-->
    </style>
</head>

<body>
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
            <td style="padding: 20px 0;">
                <table class="email-container" role="presentation" cellspacing="0" cellpadding="0" border="0"
                    width="100%">
                    <!-- Header -->
                    <tr>
                        <td>
                            <table class="header-table" role="presentation" cellspacing="0" cellpadding="0"
                                border="0">
                                <tr>
                                    <td class="header-content">
                                        <h1 class="header-title">Asset Assignment Notification</h1>
                                        <p class="header-subtitle">Official confirmation of company asset allocation</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td class="content-wrapper">
                            <!-- Employee Information -->
                            <table class="section-table" role="presentation" cellspacing="0" cellpadding="0"
                                border="0">
                                <tr>
                                    <td class="section-header">
                                        <h2 class="section-title">Employee Information</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="section-content">
                                        <table class="info-table" role="presentation" cellspacing="0" cellpadding="0"
                                            border="0">
                                            <tr class="info-row">
                                                <td class="info-label">Full Name</td>
                                                <td class="info-value">
                                                    {{ $data['assigned_user']['name'] ?? '-' }}
                                                </td>
                                            </tr>
                                            <tr class="info-row">
                                                <td class="info-label">Position</td>
                                                <td class="info-value">
                                                    {{ $data['assigned_user']['job_title'] ?? '-' }}
                                                </td>
                                            </tr>
                                            <tr class="info-row">
                                                <td class="info-label">Email</td>
                                                <td class="info-value">
                                                    {{ $data['assigned_user']['email'] ?? '-' }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Assigned Assets -->
                            <table class="section-table" role="presentation" cellspacing="0" cellpadding="0"
                                border="0">
                                <tr>
                                    <td class="section-header">
                                        <h2 class="section-title">Assigned Company Assets</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="section-content">
                                        @foreach ($data['assets'] as $asset)
                                            <table class="asset-card" role="presentation" cellspacing="0"
                                                cellpadding="0" border="0">
                                                <tr>
                                                    <td class="asset-header">
                                                        <table class="asset-title-table" role="presentation"
                                                            cellspacing="0" cellpadding="0" border="0">
                                                            <tr>
                                                                <td>
                                                                    <h3 class="asset-name">{{ $asset['name'] }}</h3>
                                                                </td>
                                                                <td align="right">
                                                                    <span
                                                                        class="badge">{{ $asset['manufacture']['name'] }}</span>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td class="asset-details">
                                                        <table class="detail-table" role="presentation" cellspacing="0"
                                                            cellpadding="0" border="0">
                                                            <tr class="detail-row">
                                                                <td class="detail-label">Serial Number</td>
                                                                <td class="detail-value">{{ $asset['serial_number'] }}
                                                                </td>
                                                            </tr>
                                                            <tr class="detail-row">
                                                                <td class="detail-label">Asset Tag</td>
                                                                <td class="detail-value">{{ $asset['asset_tag'] }}</td>
                                                            </tr>
                                                            <tr class="detail-row">
                                                                <td class="detail-label">Category</td>
                                                                <td class="detail-value">
                                                                    {{ $asset['category']['name'] }}</td>
                                                            </tr>
                                                        </table>
                                                    </td>
                                                </tr>
                                            </table>
                                        @endforeach
                                    </td>
                                </tr>
                            </table>

                            <!-- Assignment Details -->
                            <table class="section-table" role="presentation" cellspacing="0" cellpadding="0"
                                border="0">
                                <tr>
                                    <td class="section-header">
                                        <h2 class="section-title">Assignment Details</h2>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="section-content">
                                        <table class="info-table" role="presentation" cellspacing="0" cellpadding="0"
                                            border="0">
                                            <tr class="info-row">
                                                <td class="info-label">Assignment Date</td>
                                                <td class="info-value">
                                                    {{ \App\Helpers\DateHelper::format($data['assigned_at']) }}
                                                    <small>(UTC)</small>
                                                </td>

                                            </tr>
                                            <tr class="info-row">
                                                <td class="info-label">Administrative Notes</td>
                                                <td class="info-value">
                                                    {{ $data['notes'] ?? '-' }}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Divider -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                                width="100%">
                                <tr>
                                    <td style="height: 1px; background-color: #e5e7eb;"></td>
                                </tr>
                            </table>

                            <!-- Confirmation Section -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0"
                                width="100%">
                                <tr>
                                    <td>
                                        <div class="confirmation-section"
                                            style="background-color: #f9fafb; border: 1px solid #3f3f3f; padding: 20px; text-align: center; margin: 20px 0;">
                                            <p class="confirmation-text"
                                                style="color: #374151; margin-bottom: 15px; font-size: 16px; font-weight: 500; line-height: 1.5;">
                                                <strong>Action Required:</strong> Please confirm receipt and acceptance
                                                of the assigned company assets below. This confirmation is mandatory and
                                                must be completed within 24 hours of receiving this notification.
                                            </p>
                                            <a href="{{ $confirmation_url }}" class="confirm-button"
                                                style="display: inline-block; background-color: #004165; color: #ffffff; padding: 12px 24px; border: none; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">Confirm
                                                Asset Receipt</a>
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td class="footer-section"
                            style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                            <p class="footer-text"
                                style="margin: 0 0 5px 0; color: #6b7280; font-size: 14px; line-height: 1.5;">This is
                                an official automated notification from the Corporate Asset Management System.</p>
                            <p class="footer-text" style="margin: 0; font-weight: bold; color: #374151;">For
                                assistance or inquiries regarding this asset assignment, please contact the IT Support
                                Department immediately.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>
