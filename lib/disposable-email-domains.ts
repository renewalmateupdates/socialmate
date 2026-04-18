// Known disposable / temporary email domain blocklist
// Prevents free-tier credit farming via throwaway accounts
const BLOCKED_DOMAINS = new Set([
  // Mailinator family
  'mailinator.com','mailinator2.com','mailinator.net','mailinater.com',
  // Guerrilla Mail family
  'guerrillamail.com','guerrillamail.org','guerrillamail.net','guerrillamail.biz',
  'guerrillamail.de','guerrillamail.info','guerrillamailblock.com',
  'grr.la','spam4.me','sharklasers.com','guerrillamailblock.com',
  // 10 Minute Mail
  '10minutemail.com','10minutemail.net','10minutemail.org','10minutemail.co.za',
  '10minutemail.de','10minutemail.eu','10minutemail.info','10minutemail.io',
  '10minutemail.us','10minutemail.be','10minute.email','10minemail.com',
  // Temp Mail
  'temp-mail.org','tempmail.com','tempmail.net','tempmail.io','tempmail.org',
  'tempinbox.com','tempinbox.net','temp-inbox.com','temp-inbox.net',
  'tempr.email','tempsky.com','temporarymail.com','temporaryemail.com',
  // Trash / throwaway
  'trashmail.com','trashmail.at','trashmail.io','trashmail.me','trashmail.net',
  'trashmail.org','trashmail.xyz','trash-mail.at','thrashmail.com',
  'throwam.com','throwaway.email','throam.com','throwam.net',
  // Yopmail
  'yopmail.com','yopmail.fr','cool.fr.nf','jetable.fr.nf','nospam.ze.tc',
  'nomail.xl.cx','mega.zik.dj','speed.1s.fr','courriel.fr.nf',
  'moncourrier.fr.nf','monemail.fr.nf','monmail.fr.nf',
  // Maildrop / Mailnull / others
  'maildrop.cc','mailnull.com','mailnull.net','maildrop.net',
  'spamgourmet.com','spamgourmet.org','spamgourmet.net',
  'spamspot.com','spam.la','spamex.com','spambox.us','spaml.com',
  'spamfree24.org','antispam24.de','spam.re',
  // Dispostable / Fakeinbox
  'dispostable.com','fakeinbox.com','fakemail.fr','fakemail.net',
  // GetNada / Mohmal / others
  'getnada.com','mohmal.com','mohmal.im','mohmal.tech',
  'nwytg.net','trbvm.com','harakirimail.com','mt2015.com',
  // Dropmail / Discard
  'dropmail.me','discard.email','discardmail.com','discardmail.de',
  // Mailtemp / Emailondeck
  'mailtemp.info','emailondeck.com','disposablemail.com',
  // GetAirmail / Filzmail
  'getairmail.com','filzmail.com','filzmail.de',
  // Other common services
  'mytemp.email','tempemail.net','tempemail.co','mytempemail.com',
  'spamevader.com','spamfree.eu','spamhere.org','spamhole.com',
  'spaminbox.com','spaml.de','spamstack.net','spamthis.co.uk',
  'tempsky.com','tempusemail.com','trashdevil.com','trashdevil.de',
  'trashemail.de','trashimail.com','trashimail.de','tyldd.com',
  'uggsrock.com','upliftnow.com','uroid.com','veryrealemail.com',
  'viditag.com','viditag.net','viewcastmedia.net','vomoto.com',
  'wilemail.com','willhackforfood.biz','wuzup.net','wzukltd.com',
  'xagloo.com','xemaps.com','xents.com','xmaily.com','xoxy.net',
  'yapped.net','yaraon.com','yep.it','yogamaven.com','yuurok.com',
  'zehnminutenmail.de','zippymail.info','zoemail.net','zoemail.org',
  'zomg.info','einrot.com','rhyta.com','cuvox.de','dayrep.com',
  'einrot.de','fleckens.hu','gustr.com','jourrapide.com','semaphor.de',
  'superrito.com','teleworm.us','armyspy.com','cuvox.de','dayrep.com',
  // BurnerMail / SimpleLogin / AnonAddy (forwarding services)
  'burnermail.io','simplelogin.io','anonaddy.com','anonaddy.me',
  'aleeas.com','spamok.com',
])

export function isDisposableEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1]
  if (!domain) return false
  return BLOCKED_DOMAINS.has(domain)
}

export function getEmailDomain(email: string): string {
  return email.trim().toLowerCase().split('@')[1] ?? ''
}
