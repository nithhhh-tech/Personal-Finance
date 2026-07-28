<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title }}</title>
</head>
<body style="margin:0; padding:0; background:#2a1a12; color:#f8efe3; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    <div style="display:none; max-height:0; overflow:hidden; opacity:0;">{{ $preheader }}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#2a1a12; background-image:linear-gradient(180deg,#321f16 0%,#24160f 100%); margin:0; padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;">
                    <tr>
                        <td style="padding:0 0 18px;">
                            <table role="presentation" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td style="width:46px; height:46px; border-radius:10px; background:#d7a86e; color:#2a1a12; text-align:center; font-size:24px; font-weight:800;">$</td>
                                    <td style="padding-left:12px;">
                                        <div style="font-size:18px; line-height:24px; font-weight:800; color:#fff8ef;">PocketLedger</div>
                                        <div style="font-size:12px; line-height:18px; color:#d9c4ad;">Daily Spend Tracker</div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td style="border:1px solid rgba(143,99,62,.55); border-radius:12px; background:#3a251a; box-shadow:0 18px 45px rgba(0,0,0,.28); overflow:hidden;">
                            <div style="height:6px; background:#d7a86e;"></div>
                            <div style="padding:34px 32px 30px;">
                                <div style="display:inline-block; border:1px solid rgba(242,195,139,.35); border-radius:6px; padding:6px 10px; color:#f2c38b; font-size:12px; font-weight:800; letter-spacing:.16em; text-transform:uppercase;">{{ $eyebrow }}</div>
                                <h1 style="margin:18px 0 10px; color:#fff8ef; font-size:30px; line-height:38px; font-weight:800;">{{ $title }}</h1>
                                <p style="margin:0; color:#d9c4ad; font-size:16px; line-height:26px;">{{ $body }}</p>

                                <table role="presentation" cellspacing="0" cellpadding="0" style="margin:28px 0;">
                                    <tr>
                                        <td style="border-radius:8px; background:#d7a86e;">
                                            <a href="{{ $actionUrl }}" style="display:inline-block; padding:14px 22px; color:#2a1a12; font-size:15px; line-height:20px; font-weight:800; text-decoration:none;">{{ $actionText }}</a>
                                        </td>
                                    </tr>
                                </table>

                                <p style="margin:0 0 16px; color:#d9c4ad; font-size:14px; line-height:24px;">{{ $note }}</p>
                                <div style="border-top:1px solid rgba(143,99,62,.45); margin-top:24px; padding-top:20px;">
                                    <p style="margin:0 0 8px; color:#b89a7f; font-size:12px; line-height:20px;">If the button does not work, copy and paste this link into your browser:</p>
                                    <a href="{{ $actionUrl }}" style="color:#f2c38b; font-size:12px; line-height:20px; word-break:break-all;">{{ $actionUrl }}</a>
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:22px 12px 0;">
                            <p style="margin:0; color:#b89a7f; font-size:12px; line-height:20px;">This message was sent by PocketLedger to protect your personal money tracker.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
