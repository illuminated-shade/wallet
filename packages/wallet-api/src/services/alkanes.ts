/**
 * Alkanes-related API methods - Fully compatible with openapi.ts
 */

import type { BaseHttpClient, HttpClient } from '../client/http-client'
import type {
  AlkanesBalance,
  AddressAlkanesTokenSummary,
  UTXO,
  UserToSignInput,
  AlkanesInfo,
  AlkanesCollection,
} from '../types'

export class AlkanesService {
  constructor(private readonly httpClient: BaseHttpClient) {}

  // ========================================
  // Alkanes related
  // ========================================

  /**
   * Get address Alkanes list
   */
  async getAlkanesList(
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: AlkanesBalance[]; total: number }> {
    return this.httpClient.get('/v5/alkanes/list', {
      query: { address, cursor, size },
    })
  }

  /**
   * Get Alkanes UTXO
   */
  async getAlkanesUtxos(address: string, alkaneid: string): Promise<UTXO[]> {
    return this.httpClient.get('/v5/alkanes/utxos', {
      query: { address, alkaneid },
    })
  }

  async getAddressAlkanesTokenSummary(
    address: string,
    alkaneid: string,
    fetchAvailable?: boolean
  ): Promise<AddressAlkanesTokenSummary> {
    return this.httpClient.get(
      `/v5/alkanes/token-summary?address=${address}&alkaneid=${alkaneid}&fetchAvailable=${
        fetchAvailable ? true : false
      }`,
      {}
    )
  }

  async getAlkanesCollectionList(
    address: string,
    cursor: number,
    size: number
  ): Promise<{ list: AlkanesCollection[]; total: number }> {
    return this.httpClient.get('/v5/alkanes/collection/list', {
      query: { address, cursor, size },
    })
  }

  async getAlkanesCollectionItems(
    address: string,
    collectionId: string,
    cursor: number,
    size: number
  ): Promise<{ list: AlkanesInfo[]; total: number }> {
    return this.httpClient.get('/v5/alkanes/collection/items', {
      query: { address, collectionId, cursor, size },
    })
  }

  async createAlkanesSendTx({
    userAddress,
    userPubkey,
    receiver,
    alkaneid,
    amount,
    feeRate,
    enableRBF = true,
  }: {
    userAddress: string
    userPubkey: string
    receiver: string
    alkaneid: string
    amount: string
    feeRate: number
    enableRBF?: boolean
  }): Promise<{
    orderId: string
    psbtHex: string
    toSignInputs: UserToSignInput[]
  }> {
    return this.httpClient.post('/v5/alkanes/create-send-tx', {
      userAddress,
      userPubkey,
      receiver,
      alkaneid,
      amount,
      feeRate,
      enableRBF,
    })
  }
}
