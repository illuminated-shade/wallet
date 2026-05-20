import { Button, Card, Column, Content, Footer, Header, Icon, Input, Layout, Row, Text } from '@/ui/components';
import { ColdWalletSignMessage } from '@/ui/components/ColdWallet';
import LoadingPage from '@/ui/components/LoadingPage';
import { PhishingDetection } from '@/ui/components/PhishingDetection';
import WebsiteBar from '@/ui/components/WebsiteBar';
import { fontSizes } from '@/ui/theme/font';
import { KeystoneSignEnum } from '@unisat/keyring-service/types';
import { AccountSignMethod, SignMessageType } from '@unisat/wallet-shared';
import { SignMessageProps, useCurrentAccountCapabilities, useSignMessageLogic, useTools } from '@unisat/wallet-state';

import KeystoneSignScreen from '../../Wallet/KeystoneSignScreen';
import MultiSignDisclaimerModal from './SignPsbt/components/MultiSignDisclaimerModal';

export default function SignMessage(props: SignMessageProps) {
  const {
    loading,
    t,
    session,

    // page state
    isKeystoneSigning,
    isColdWalletSigning,
    showMultiSignView,

    disclaimerVisible,

    // data
    toSignMessages,
    currentToSignMessage,

    // state
    isScammer,
    allowQuickMultiSign,

    // multiple sign state
    isAllSigned,
    signedCount,
    multiSignList,

    // actions
    onClickBack,
    onClickSign,
    onQuickMultiSign,
    onTryMultiSign,
    onTrustSite,

    onKeystoneSigningSuccess,
    onKeystoneSigningBack,

    onColdWalletSigningSuccess,
    onColdWalletSigningBack,

    readonlySignature,
    setReadonlySignature,

    onDisclaimerModalClose
  } = useSignMessageLogic(props);
  const accountCapabilities = useCurrentAccountCapabilities();
  const tools = useTools();
  const isReadonly = accountCapabilities.signMethod === AccountSignMethod.External;

  let header = props.header;

  if (!header && session) {
    header = (
      <Header>
        <WebsiteBar session={session} />
      </Header>
    );
  }

  // condition render
  if (loading) {
    return <LoadingPage />;
  }

  if (isScammer) {
    return <PhishingDetection handleCancel={onClickBack} />;
  }

  if (isKeystoneSigning && currentToSignMessage) {
    return (
      <KeystoneSignScreen
        type={
          currentToSignMessage.type === SignMessageType.BIP322_SIMPLE
            ? KeystoneSignEnum.BIP322_SIMPLE
            : KeystoneSignEnum.MSG
        }
        data={currentToSignMessage.text}
        onSuccess={onKeystoneSigningSuccess}
        onBack={onKeystoneSigningBack}
      />
    );
  }

  // Handle cold wallet signing
  if (isColdWalletSigning && currentToSignMessage) {
    return (
      <ColdWalletSignMessage
        messages={[{ text: currentToSignMessage.text, type: currentToSignMessage.type }]}
        onSuccess={(ret) =>
          onColdWalletSigningSuccess({
            signature: ret[0]
          })
        }
        onCancel={onColdWalletSigningBack}
        header={header}
      />
    );
  }

  if (showMultiSignView) {
    return (
      <Layout>
        {header}
        <Content>
          <Text text={t('sign_multiple_transactions')} preset="title-bold" textCenter mt="lg" />
          <Column>
            {multiSignList.map(({ title, buttonText, buttonPreset, onClick }, index) => {
              return (
                <Card key={index}>
                  <Row justifyBetween fullX>
                    <Column>
                      <Text text={`${t('message')} ${index + 1}`} preset="bold" />
                      <Text text={title} wrap />
                    </Column>
                    <Column>
                      <Button
                        preset={buttonPreset as any}
                        textStyle={{ fontSize: fontSizes.sm }}
                        text={buttonText}
                        onClick={onClick}
                        style={{ width: 80, height: 25 }}
                      />
                    </Column>
                  </Row>
                </Card>
              );
            })}
          </Column>
        </Content>

        <Footer>
          <Row full>
            <Button preset="default" text={t('reject_all')} onClick={onClickBack} full />

            <Button
              preset="primary"
              text={isAllSigned ? t('submit') : `(${signedCount}/${toSignMessages.length}) ${t('signed')}`}
              icon={isAllSigned ? undefined : 'alert'}
              onClick={() => {
                if (allowQuickMultiSign) {
                  onQuickMultiSign();
                } else {
                  onTryMultiSign();
                }
              }}
              full
            />
          </Row>
        </Footer>
        {disclaimerVisible && (
          <MultiSignDisclaimerModal
            txCount={toSignMessages.length}
            onContinue={(trustSite) => {
              if (trustSite) onTrustSite();
              onQuickMultiSign();
            }}
            onClose={onDisclaimerModalClose}
          />
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <Content>
        <Header>
          <WebsiteBar session={session} />
        </Header>
        <Column>
          <Text text={t('signature_request')} preset="title-bold" textCenter mt="lg" />
          <Text text={t('only_sign_this_message_if_you_fully_understand_the')} preset="sub" textCenter mt="lg" />
          <Text text={t('you_are_signing')} textCenter mt="lg" />

          <Card>
            <div
              style={{
                userSelect: 'text',
                maxHeight: 384,
                overflow: 'auto',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                flexWrap: 'wrap'
              }}
            >
              {currentToSignMessage.text}
            </div>
          </Card>
          {isReadonly && (
            <>
              <Row
                itemsCenter
                gap="sm"
                onClick={() => {
                  const base64Text = Buffer.from(currentToSignMessage.text).toString('base64');
                  tools.copyToClipboard(base64Text);
                }}
              >
                <Icon icon="copy" color="textDim" />
                <Text text={t('copy_message_to_sign')} color="textDim" />
              </Row>

              <Input
                preset="text"
                placeholder={t('enter_your_signature')}
                autoFocus
                value={readonlySignature}
                onChange={(e) => {
                  setReadonlySignature(e.target.value.trim());
                }}
              />
            </>
          )}
        </Column>
      </Content>

      {/* footer buttons */}
      <Footer>
        <Row full>
          <Button preset="default" text={t('reject')} onClick={onClickBack} full />
          <Button preset="primary" text={t('sign')} onClick={onClickSign} full />
        </Row>
      </Footer>
    </Layout>
  );
}
