(() => {
  'use strict';
  if (!/\/apps\/fase-a\//i.test(location.pathname)) return;

  const params = new URLSearchParams(location.search);
  const grade = String(params.get('grade') || '').trim().toUpperCase();
  if (grade !== 'I') return;

  const VERSION = '20260909-cute-cover-1';
  const COVER_IMAGE = 'data:image/webp;base64,UklGRmxKAQBXRUJQVlA4IGBKAQDwhQadASqEA0YFPpFEnEolo6wtp5KKgbASCU3bGsysJWXtWv/7nhz87ub3wimfuR/rdj2Mz3n+Y/dj/Ie/Bxf3P+5fwn+Z/43+I+U/+z4/+4/9Xz0Omv/B/mfzT+Vv/K/9f+3/2PxH/Uv/g/zX7//+f7Cf1v/7v+M/2ntu/tr78P3m/Kf4Jf17/Xfuh/wfiD/7X7e+9n/B/9X9uf938hH9Z/0//6/53ax/u////cU/rH/V//X/X94X/3fvP/9Plz/sX/b/dD/rfJN+3f///5H/q+AD//+3B/AP//rWPlX9p4m/l/5j7ofajx//D7lPuT/V/EayH7yrmPMa+EM1vDr+b9QLzp8Wf8/6hXlI/9vm6/YvUX6Z5Youb9Cl4oR1K99URkSRLwUK5iZzXmxZruSH2ruiQoUh8FHlIZQByOweCCuHIlnWuIgwUW8mHnXSC/BjhHREbfeerQiayXuY7rVZaG9Wc9CedhCrk+MyWdC6DmvFmOpR3Mf4xLYnS1V4yYFfiKtAac8u8AQxGNs/oSHaet5M+YvLJFCj/hmGV9R4881Z8z2fhBlAUsGHcCYIg5TXzPjNFDxAzVBmjjjuHMkN0St7fdACG5CAjW0gTOk51dvW5YDlbLdFV2nkLp1+mZaqYI/T1PBpdGfZISdcjJVFUKBy0CBzHQ9T6UZYYDj/KJ/rgLEvXmQ/qfiVykGEymaFC5NFzL3+8KYLS9MDa9/NnpDIDESOyDSQ53HGUyDR/C7dIZNM/j1giTB3VDvL7H3o27jBB4yH200kPPs4BfThivl9AWX1krjac8EXdCLblMqZ0HuM4J2yynIflBXDuE7Vi54uSHoW1obmgcm5Mx7H/aNP6X78lFdBc2xMlL7MEm7MRb8nXz+FcRbHdRK31WjiXfMlf0zZOPUZblII8Hs6soJ/7ehHnJRJtiaEvR6BrJbitmUAnpL7xXnC9yxJmxBMgERyepO9EcQu7w3HzUUzBhdwj4hkv1NhcgAwxSl1ZpKQVjs5tFSilfChRFyMglcchNe1KPgz0gwmiA+5oK0Q7XiZpCuINN3FyJJv131RWIHDfIl//Y7PP69+1FWGsVKYnYOcSgK7Jbe9xEYqOl7Y/OkEtcjX4Wa4PSB2G4yW5h6cAAJIhJ3z¶»§q«^