type Props = { email: string }

/**
 * Password-only forms (admin password, set-password) still need a username
 * field so Chrome and password managers know which account the password
 * belongs to. Hidden and read-only — the email was already entered on step 1.
 * See https://www.chromium.org/developers/design-documents/create-amazing-password-forms
 */
export const HiddenUsernameField = ({ email }: Props) => (
  <input type="email" name="username" autoComplete="username" value={email} readOnly hidden />
)
