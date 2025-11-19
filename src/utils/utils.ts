// 从字符串生成密钥
async function importKey(keyString: string) {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(keyString)

  // 如果密钥长度不够，进行填充
  let keyBytes = keyData
  if (keyData.length < 16) {
    keyBytes = new Uint8Array(16)
    keyBytes.set(keyData)
    for (let i = keyData.length; i < 16; i++) {
      keyBytes[i] = keyData[i % keyData.length]
    }
  } else if (keyData.length > 16) {
    keyBytes = keyData.slice(0, 16)
  }

  return await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-CTR' }, false, [
    'encrypt',
    'decrypt',
  ])
}

// 从字符串生成 IV
function stringToIV(ivString: string) {
  const encoder = new TextEncoder()
  const ivBytes = encoder.encode(ivString)
  const result = new Uint8Array(16)

  if (ivBytes.length >= 16) {
    return ivBytes.slice(0, 16)
  }

  result.set(ivBytes)
  for (let i = ivBytes.length; i < 16; i++) {
    result[i] = ivBytes[i % ivBytes.length]
  }
  return result
}

// 加密函数
export async function encryptWithCTR(plaintext: string, keyString: string, ivString: string) {
  const key = await importKey(keyString)
  const iv = stringToIV(ivString)

  const encodedText = new TextEncoder().encode(plaintext)

  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-CTR',
      counter: iv,
      length: 64,
    },
    key,
    encodedText,
  )

  // 加密
  const result = new Uint8Array(ciphertext.byteLength)
  result.set(new Uint8Array(ciphertext))

  return btoa(String.fromCharCode(...result))
}

// 解密函数
export async function decryptWithCTR(encryptedData: string, keyString: string, ivString: string) {
  const key = await importKey(keyString)
  const iv = stringToIV(ivString)

  const ciphertext = new Uint8Array(
    atob(encryptedData)
      .split('')
      .map((c) => c.charCodeAt(0)),
  )
  const plaintext = await crypto.subtle.decrypt(
    {
      name: 'AES-CTR',
      counter: iv,
      length: 64,
    },
    key,
    ciphertext,
  )

  return new TextDecoder().decode(plaintext)
}

// 使用示例
// export async function example() {
//   const keyString = 'aswrca11'
//   const ivString = 'dq141a'

//   const text = 'Hello, World! wddasdawdq31weqwe.dqw52dqwdqwd8491qw1dq1d9qw1d9q1wd919w4qe94qw9e16'

//   const encrypted = await encryptWithCTR(text, keyString, ivString)
//   console.log('加密结果:', encrypted)
//   console.log('长度对比:', {
//     原文长度: text.length,
//     密文长度: encrypted.length,
//   })

//   const decrypted = await decryptWithCTR(encrypted, keyString, ivString)
//   console.log('解密结果:', decrypted)
// }

/**
 * 缓存 session，关闭浏览器后失效
 *
 * @example cacheSession('key', 'value') // 设置缓存
 * @example cacheSession('key')  // 获取缓存
 * @param key
 * @param value
 * @returns
 */
export function cacheSession(key: string, value: any = '') {
  if (value) {
    return chrome.storage.session.set({ [key]: value })
  } else {
    return chrome.storage.session.get(key)
  }
}

/**
 * 获取 URL 图标
 * @param item
 * @returns
 */
export function getFavoriteIcon(url?: string) {
  // 正则判断是否为合法 url
  if (!url) return ''
  if (!/^https?:\/\//.test(url)) return ''
  try {
    const urlObj = new URL(chrome.runtime.getURL('/_favicon/'))
    urlObj.searchParams.set('pageUrl', url)
    urlObj.searchParams.set('size', '32')
    return urlObj.toString()
  } catch {
    return ''
  }
}
