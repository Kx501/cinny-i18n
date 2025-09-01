import React, { useMemo } from 'react';
import { Box, Text, color } from 'folds';
import { Link, useSearchParams } from 'react-router-dom';
import { SSOAction } from 'matrix-js-sdk';
import { useTranslation } from 'react-i18next';
import { useAuthServer } from '../../../hooks/useAuthServer';
import { RegisterFlowStatus, useAuthFlows } from '../../../hooks/useAuthFlows';
import { useParsedLoginFlows } from '../../../hooks/useParsedLoginFlows';
import { PasswordRegisterForm, SUPPORTED_REGISTER_STAGES } from '../register/PasswordRegisterForm';
import { OrDivider } from '../OrDivider';
import { SSOLogin } from '../SSOLogin';
import { SupportedUIAFlowsLoader } from '../../../components/SupportedUIAFlowsLoader';
import { getLoginPath } from '../../pathUtils';
import { usePathWithOrigin } from '../../../hooks/usePathWithOrigin';
import { RegisterPathSearchParams } from '../../paths';

const useRegisterSearchParams = (searchParams: URLSearchParams): RegisterPathSearchParams =>
  useMemo(
    () => ({
      username: searchParams.get('username') ?? undefined,
      email: searchParams.get('email') ?? undefined,
      token: searchParams.get('token') ?? undefined,
    }),
    [searchParams]
  );

export function Register() {
  const { t } = useTranslation();
  const server = useAuthServer();
  const { loginFlows, registerFlows } = useAuthFlows();
  const [searchParams] = useSearchParams();
  const registerSearchParams = useRegisterSearchParams(searchParams);
  const { sso } = useParsedLoginFlows(loginFlows.flows);

  // redirect to /login because only that path handle m.login.token
  const ssoRedirectUrl = usePathWithOrigin(getLoginPath(server));

  return (
    <Box direction="Column" gap="500">
      <Text size="H2" priority="400">
        {t('pages:auth.register.register')}
      </Text>
      {registerFlows.status === RegisterFlowStatus.RegistrationDisabled && !sso && (
        <Text style={{ color: color.Critical.Main }} size="T300">
          {t('pages:auth.register.registration_disabled')}
        </Text>
      )}
      {registerFlows.status === RegisterFlowStatus.RateLimited && !sso && (
        <Text style={{ color: color.Critical.Main }} size="T300">
          {t('pages:auth.register.you_have_been_rate_limited')}
        </Text>
      )}
      {registerFlows.status === RegisterFlowStatus.InvalidRequest && !sso && (
        <Text style={{ color: color.Critical.Main }} size="T300">
          {t('pages:auth.register.invalid_request_failed_to_get_registration_options')}
        </Text>
      )}
      {registerFlows.status === RegisterFlowStatus.FlowRequired && (
        <>
          <SupportedUIAFlowsLoader
            flows={registerFlows.data.flows ?? []}
            supportedStages={SUPPORTED_REGISTER_STAGES}
          >
            {(supportedFlows) =>
              supportedFlows.length === 0 ? (
                <Text style={{ color: color.Critical.Main }} size="T300">
                  {t('pages:auth.register.app_not_support_registration')}
                </Text>
              ) : (
                <PasswordRegisterForm
                  authData={registerFlows.data}
                  uiaFlows={supportedFlows}
                  defaultUsername={registerSearchParams.username}
                  defaultEmail={registerSearchParams.email}
                  defaultRegisterToken={registerSearchParams.token}
                />
              )
            }
          </SupportedUIAFlowsLoader>
          <span data-spacing-node />
          {sso && <OrDivider />}
        </>
      )}
      {sso && (
        <>
          <SSOLogin
            providers={sso.identity_providers}
            redirectUrl={ssoRedirectUrl}
            action={SSOAction.REGISTER}
            saveScreenSpace={registerFlows.status === RegisterFlowStatus.FlowRequired}
          />
          <span data-spacing-node />
        </>
      )}
      <Text align="Center">
        {t('pages:auth.register.already_have_an_account')} <Link to={getLoginPath(server)}>{t('pages:auth.register.login')}</Link>
      </Text>
    </Box>
  );
}
