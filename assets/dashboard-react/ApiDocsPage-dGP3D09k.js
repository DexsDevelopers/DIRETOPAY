import{a as w}from"./rolldown-runtime-WehaI0Q3.js";import{a as f}from"./vendor-motion-BfnOqO3c.js";import{h as y}from"./vendor-charts-DkalkS0U.js";import{n as o}from"./vendor-router-Crjtektr.js";import{An as v,D as k,G as _,Jt as P,Lt as S,Pt as C,Xt as m,Zt as A,en as h,i as R,kt as u,sn as T,t as b,vn as q,y as j,z as g}from"./vendor-icons-BUPMymzo.js";import{t as d}from"./utils-BItpez6K.js";var p=w(y(),1),e=f(),n=({code:r,language:i="bash"})=>{const[t,a]=p.useState(!1),s=()=>{navigator.clipboard.writeText(r),a(!0),setTimeout(()=>a(!1),2e3)};return(0,e.jsxs)("div",{className:"relative group rounded-2xl overflow-hidden bg-black/40 border border-white/5 font-mono text-sm leading-relaxed",children:[(0,e.jsxs)("div",{className:"flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/5",children:[(0,e.jsx)("span",{className:"text-[10px] font-black text-white/20 uppercase tracking-widest",children:i}),(0,e.jsx)("button",{onClick:s,className:"text-white/20 hover:text-white transition-colors",children:t?(0,e.jsx)(T,{size:14,className:"text-primary"}):(0,e.jsx)(P,{size:14})})]}),(0,e.jsx)("pre",{className:"p-5 overflow-x-auto text-white/70 whitespace-pre text-[13px] leading-6",children:r})]})},x=({tabs:r})=>{const[i,t]=(0,p.useState)(0);return(0,e.jsxs)("div",{className:"rounded-2xl overflow-hidden border border-white/5 bg-black/40",children:[(0,e.jsx)("div",{className:"flex overflow-x-auto border-b border-white/5 bg-white/[0.02]",children:r.map((a,s)=>(0,e.jsx)("button",{onClick:()=>t(s),className:d("px-5 py-2.5 text-[11px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-b-2",i===s?"text-primary border-primary bg-primary/5":"text-white/30 border-transparent hover:text-white/60"),children:a.label},s))}),(0,e.jsx)("pre",{className:"p-5 overflow-x-auto text-white/70 font-mono text-[13px] leading-6 whitespace-pre",children:r[i].code})]})},c=({name:r,type:i,required:t,desc:a})=>(0,e.jsxs)("tr",{className:"border-b border-white/5 last:border-0",children:[(0,e.jsxs)("td",{className:"py-3 pr-4",children:[(0,e.jsx)("code",{className:"text-primary text-sm font-bold",children:r}),t&&(0,e.jsx)("span",{className:"ml-2 text-[9px] font-black text-red-400 uppercase",children:"obrigatório"})]}),(0,e.jsx)("td",{className:"py-3 pr-4 text-white/30 text-xs font-mono",children:i}),(0,e.jsx)("td",{className:"py-3 text-white/50 text-sm",children:a})]}),N=[{group:"Introdução",items:[{id:"overview",label:"Visão Geral"},{id:"auth",label:"Autenticação"},{id:"base-url",label:"Base URL"},{id:"rate-limits",label:"Rate Limits"}]},{group:"Endpoints",items:[{id:"create-pix",label:"Gerar Cobrança Pix"},{id:"check-status",label:"Consultar Status"},{id:"webhooks",label:"Webhooks"}]},{group:"Exemplos",items:[{id:"examples",label:"Exemplos de Código"}]},{group:"Referência",items:[{id:"errors",label:"Códigos de Erro"},{id:"sdks",label:"SDKs & Integrações"}]}];function L(){const[r,i]=(0,p.useState)("overview");return(0,p.useEffect)(()=>{const t=()=>{const a=N.flatMap(s=>s.items.map(l=>l.id));for(const s of a.reverse()){const l=document.getElementById(s);if(l&&l.getBoundingClientRect().top<=120){i(s);break}}};return window.addEventListener("scroll",t,{passive:!0}),()=>window.removeEventListener("scroll",t)},[]),(0,e.jsxs)("div",{className:"bg-[#08080a] min-h-screen text-white font-['Outfit'] selection:bg-primary selection:text-black",children:[(0,e.jsx)("nav",{className:"border-b border-white/5 bg-[#08080a]/80 backdrop-blur-xl sticky top-0 z-50",children:(0,e.jsxs)("div",{className:"max-w-7xl mx-auto px-6 h-14 flex items-center justify-between",children:[(0,e.jsxs)(o,{to:"/",className:"flex items-center gap-2 group",children:[(0,e.jsx)(v,{size:16,className:"text-white/30 group-hover:text-primary transition-colors"}),(0,e.jsxs)("span",{className:"font-bold tracking-tight text-sm",children:["Direto",(0,e.jsx)("span",{className:"text-primary italic",children:"Pay"})," ",(0,e.jsx)("span",{className:"text-white/20 ml-1 font-medium",children:"DOCS"})]})]}),(0,e.jsxs)("div",{className:"flex items-center gap-4",children:[(0,e.jsx)(o,{to:"/login",className:"text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-colors hidden sm:block",children:"Entrar"}),(0,e.jsx)(o,{to:"/register",className:"bg-primary text-black text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-[0_0_20px_rgba(74,222,128,0.15)]",children:"Criar Conta"})]})]})}),(0,e.jsxs)("div",{className:"max-w-7xl mx-auto px-6 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12",children:[(0,e.jsx)("aside",{className:"hidden lg:block lg:col-span-3 sticky top-24 h-fit space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto custom-scrollbar pr-4",children:N.map((t,a)=>(0,e.jsxs)("div",{children:[(0,e.jsx)("p",{className:"text-[9px] font-black text-white/15 uppercase tracking-[0.2em] mb-3 ml-4",children:t.group}),(0,e.jsx)("ul",{className:"space-y-0.5",children:t.items.map(s=>(0,e.jsx)("li",{children:(0,e.jsx)("a",{href:`#${s.id}`,className:d("block px-4 py-2 rounded-xl text-[13px] font-semibold transition-all",r===s.id?"bg-primary/10 text-primary border border-primary/10":"text-white/40 hover:text-white/70 hover:bg-white/[0.03]"),children:s.label})},s.id))})]},a))}),(0,e.jsxs)("main",{className:"lg:col-span-9 space-y-20",children:[(0,e.jsxs)("section",{id:"overview",className:"space-y-6",children:[(0,e.jsx)("div",{className:"w-14 h-14 bg-primary/10 rounded-[20px] border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-[0_0_30px_rgba(74,222,128,0.08)]",children:(0,e.jsx)(k,{size:28})}),(0,e.jsxs)("h1",{className:"text-4xl lg:text-6xl font-black tracking-tighter leading-none",children:["BUILD WITH ",(0,e.jsx)("br",{}),(0,e.jsx)("span",{className:"text-primary italic",children:"PRECISION."})]}),(0,e.jsx)("p",{className:"text-white/40 text-lg max-w-2xl font-medium leading-relaxed",children:"API RESTful para integrar cobranças Pix instantâneas via gateway anônimo. Performance, segurança e simplicidade — pronto em menos de 5 minutos."}),(0,e.jsx)("div",{className:"grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4",children:[{icon:b,title:"Instantâneo",desc:"QR Code e Copia e Cola gerados em menos de 1s"},{icon:g,title:"Seguro",desc:"Autenticação via Bearer Token + HTTPS obrigatório"},{icon:S,title:"Escalável",desc:"Milhares de requisições simultâneas sem degradação"}].map((t,a)=>(0,e.jsxs)("div",{className:"p-5 rounded-2xl bg-white/[0.02] border border-white/5",children:[(0,e.jsx)(t.icon,{size:18,className:"text-primary mb-3"}),(0,e.jsx)("p",{className:"text-sm font-bold text-white/80 mb-1",children:t.title}),(0,e.jsx)("p",{className:"text-xs text-white/30",children:t.desc})]},a))})]}),(0,e.jsx)("hr",{className:"border-white/5"}),(0,e.jsxs)("section",{id:"auth",className:"space-y-8",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(g,{className:"text-primary",size:22}),(0,e.jsx)("h2",{className:"text-2xl font-black tracking-tight",children:"Autenticação"})]}),(0,e.jsxs)("p",{className:"text-white/50 leading-relaxed",children:["Todas as requisições à API devem incluir sua ",(0,e.jsx)("strong",{className:"text-white",children:"API Key"})," no cabeçalho ",(0,e.jsx)("code",{className:"text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs",children:"Authorization"}),". Você encontra sua chave no painel em ",(0,e.jsx)("strong",{className:"text-white",children:"Configurações → Desenvolvedor / API"}),"."]}),(0,e.jsx)(n,{language:"header",code:"Authorization: Bearer SUA_API_KEY"}),(0,e.jsxs)("div",{className:"bg-amber-500/5 border border-amber-500/10 rounded-2xl p-5 flex gap-4",children:[(0,e.jsx)(j,{className:"text-amber-500 shrink-0 mt-0.5",size:18}),(0,e.jsxs)("div",{children:[(0,e.jsx)("p",{className:"text-sm font-bold text-amber-400 mb-1",children:"Nunca exponha sua API Key"}),(0,e.jsx)("p",{className:"text-xs text-amber-500/60",children:"Mantenha sua chave no backend (server-side). Nunca a coloque em código JavaScript do frontend, apps mobile ou repositórios públicos."})]})]}),(0,e.jsxs)("div",{className:"bg-white/[0.02] border border-white/5 rounded-2xl p-5",children:[(0,e.jsx)("p",{className:"text-xs font-bold text-white/40 mb-3",children:"Métodos de autenticação suportados:"}),(0,e.jsxs)("div",{className:"space-y-2",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(h,{size:14,className:"text-primary"}),(0,e.jsxs)("span",{className:"text-sm text-white/60",children:[(0,e.jsx)("code",{className:"text-primary/80 text-xs",children:"Authorization: Bearer"})," — Header HTTP (recomendado)"]})]}),(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(h,{size:14,className:"text-primary"}),(0,e.jsxs)("span",{className:"text-sm text-white/60",children:[(0,e.jsx)("code",{className:"text-primary/80 text-xs",children:"Cookie de sessão + CSRF"})," — Para chamadas internas do dashboard"]})]})]})]})]}),(0,e.jsx)("hr",{className:"border-white/5"}),(0,e.jsxs)("section",{id:"base-url",className:"space-y-8",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(C,{className:"text-primary",size:22}),(0,e.jsx)("h2",{className:"text-2xl font-black tracking-tight",children:"Base URL"})]}),(0,e.jsx)("p",{className:"text-white/50",children:"Todas as chamadas devem ser feitas sobre HTTPS."}),(0,e.jsx)(n,{language:"url",code:"https://diretopay.site"}),(0,e.jsxs)("table",{className:"w-full text-sm",children:[(0,e.jsx)("thead",{children:(0,e.jsxs)("tr",{className:"text-left text-white/20 text-[10px] font-black uppercase tracking-widest border-b border-white/5",children:[(0,e.jsx)("th",{className:"pb-3 pr-4",children:"Ambiente"}),(0,e.jsx)("th",{className:"pb-3 pr-4",children:"URL"}),(0,e.jsx)("th",{className:"pb-3",children:"Descrição"})]})}),(0,e.jsxs)("tbody",{children:[(0,e.jsxs)("tr",{className:"border-b border-white/5",children:[(0,e.jsx)("td",{className:"py-3 pr-4 text-primary font-bold",children:"Produção"}),(0,e.jsx)("td",{className:"py-3 pr-4 font-mono text-xs text-white/50",children:"https://diretopay.site/api.php"}),(0,e.jsx)("td",{className:"py-3 text-white/40",children:"Gerar cobranças reais"})]}),(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{className:"py-3 pr-4 text-primary font-bold",children:"Status"}),(0,e.jsx)("td",{className:"py-3 pr-4 font-mono text-xs text-white/50",children:"https://diretopay.site/check_status.php"}),(0,e.jsx)("td",{className:"py-3 text-white/40",children:"Consultar status de transação"})]})]})]})]}),(0,e.jsx)("hr",{className:"border-white/5"}),(0,e.jsxs)("section",{id:"rate-limits",className:"space-y-8",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(A,{className:"text-primary",size:22}),(0,e.jsx)("h2",{className:"text-2xl font-black tracking-tight",children:"Rate Limits"})]}),(0,e.jsx)("p",{className:"text-white/50",children:"Para prevenir abusos, aplicamos limites de requisição por IP."}),(0,e.jsxs)("div",{className:"grid grid-cols-1 sm:grid-cols-2 gap-4",children:[(0,e.jsxs)("div",{className:"p-5 rounded-2xl bg-white/[0.02] border border-white/5",children:[(0,e.jsx)("p",{className:"text-xs font-black text-white/30 uppercase tracking-widest mb-2",children:"Gerar Cobrança"}),(0,e.jsxs)("p",{className:"text-2xl font-black text-white",children:["3 ",(0,e.jsx)("span",{className:"text-sm text-white/30 font-medium",children:"req / minuto / IP"})]})]}),(0,e.jsxs)("div",{className:"p-5 rounded-2xl bg-white/[0.02] border border-white/5",children:[(0,e.jsx)("p",{className:"text-xs font-black text-white/30 uppercase tracking-widest mb-2",children:"Consultar Status"}),(0,e.jsxs)("p",{className:"text-2xl font-black text-white",children:["60 ",(0,e.jsx)("span",{className:"text-sm text-white/30 font-medium",children:"req / minuto / IP"})]})]})]}),(0,e.jsx)("div",{className:"bg-white/[0.02] border border-white/5 rounded-2xl p-5 text-sm text-white/40",children:(0,e.jsxs)("p",{children:["Se o limite for excedido, a API retorna ",(0,e.jsx)("code",{className:"text-red-400",children:"429 Too Many Requests"}),". Aguarde o período de cooldown antes de tentar novamente."]})})]}),(0,e.jsx)("hr",{className:"border-white/5"}),(0,e.jsxs)("section",{id:"create-pix",className:"space-y-8",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(b,{className:"text-primary",size:22}),(0,e.jsx)("h2",{className:"text-2xl font-black tracking-tight",children:"Gerar Cobrança Pix"})]}),(0,e.jsx)("p",{className:"text-white/50",children:"Crie uma cobrança Pix instantânea. Receba o código Copia e Cola e a imagem do QR Code."}),(0,e.jsxs)("div",{className:"flex items-center gap-3 text-xs font-black",children:[(0,e.jsx)("span",{className:"px-3 py-1.5 bg-emerald-500 text-black rounded-lg",children:"POST"}),(0,e.jsx)("code",{className:"text-white/50 tracking-wide",children:"/api.php"})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("p",{className:"text-xs font-black text-white/30 uppercase tracking-widest mb-4",children:"Parâmetros do Body (JSON)"}),(0,e.jsx)("div",{className:"overflow-x-auto",children:(0,e.jsxs)("table",{className:"w-full text-sm",children:[(0,e.jsx)("thead",{children:(0,e.jsxs)("tr",{className:"text-left text-white/15 text-[10px] font-black uppercase tracking-widest border-b border-white/5",children:[(0,e.jsx)("th",{className:"pb-3 pr-4",children:"Campo"}),(0,e.jsx)("th",{className:"pb-3 pr-4",children:"Tipo"}),(0,e.jsx)("th",{className:"pb-3",children:"Descrição"})]})}),(0,e.jsxs)("tbody",{children:[(0,e.jsx)(c,{name:"amount",type:"number",required:!0,desc:"Valor em Reais (mínimo R$ 10,00)"}),(0,e.jsx)(c,{name:"customer.name",type:"string",desc:"Nome do pagador (opcional)"}),(0,e.jsx)(c,{name:"customer.doc",type:"string",desc:"CPF/CNPJ do pagador (opcional)"}),(0,e.jsx)(c,{name:"callback_url",type:"string",desc:"URL para webhook de confirmação (opcional)"}),(0,e.jsx)(c,{name:"external_id",type:"string",desc:"ID externo para referência no seu sistema (opcional)"})]})]})})]}),(0,e.jsx)(x,{tabs:[{label:"cURL",code:`curl -X POST https://diretopay.site/api.php \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SUA_API_KEY" \\
  -d '{
    "amount": 97.00,
    "customer": {
      "name": "João Silva"
    },
    "callback_url": "https://seusite.com/webhook"
  }'`},{label:"JavaScript",code:`const response = await fetch('https://diretopay.site/api.php', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer SUA_API_KEY'
  },
  body: JSON.stringify({
    amount: 97.00,
    customer: { name: 'João Silva' },
    callback_url: 'https://seusite.com/webhook'
  })
});

const data = await response.json();
console.log(data.pix_code);     // Código copia e cola
console.log(data.qr_image);     // URL da imagem QR`},{label:"Python",code:`import requests

response = requests.post(
    'https://diretopay.site/api.php',
    headers={
        'Authorization': 'Bearer SUA_API_KEY'
    },
    json={
        'amount': 97.00,
        'customer': {'name': 'João Silva'},
        'callback_url': 'https://seusite.com/webhook'
    }
)

data = response.json()
print(data['pix_code'])      # Código copia e cola
print(data['qr_image'])      # URL da imagem QR`},{label:"PHP",code:`<?php
$ch = curl_init('https://diretopay.site/api.php');
curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer SUA_API_KEY'
    ],
    CURLOPT_POSTFIELDS => json_encode([
        'amount' => 97.00,
        'customer' => ['name' => 'João Silva'],
        'callback_url' => 'https://seusite.com/webhook'
    ])
]);

$response = curl_exec($ch);
$data = json_decode($response, true);

echo $data['pix_code'];    // Código copia e cola
echo $data['qr_image'];    // URL da imagem QR`},{label:"C#",code:`using var client = new HttpClient();
client.DefaultRequestHeaders.Add("Authorization", "Bearer SUA_API_KEY");

var payload = new {
    amount = 97.00,
    customer = new { name = "João Silva" },
    callback_url = "https://seusite.com/webhook"
};

var json = JsonSerializer.Serialize(payload);
var content = new StringContent(json, Encoding.UTF8, "application/json");
var response = await client.PostAsync("https://diretopay.site/api.php", content);
var result = await response.Content.ReadAsStringAsync();

Console.WriteLine(result);`},{label:"Java",code:`HttpClient client = HttpClient.newHttpClient();

String body = """
  {
    "amount": 97.00,
    "customer": { "name": "João Silva" },
    "callback_url": "https://seusite.com/webhook"
  }
  """;

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://diretopay.site/api.php"))
    .header("Content-Type", "application/json")
    .header("Authorization", "Bearer SUA_API_KEY")
    .POST(HttpRequest.BodyPublishers.ofString(body))
    .build();

HttpResponse<String> response = client.send(request,
    HttpResponse.BodyHandlers.ofString());
System.out.println(response.body());`}]}),(0,e.jsxs)("div",{className:"space-y-4",children:[(0,e.jsx)("p",{className:"text-xs font-black text-white/30 uppercase tracking-widest",children:"Resposta de Sucesso — 200 OK"}),(0,e.jsx)(n,{language:"json",code:`{
  "success": true,
  "pix_id": "abc123-def456",
  "amount": 97.00,
  "pix_code": "00020101021226890014br.gov.bcb.pix2564qr...",
  "qr_image": "https://api.pixgo.org/qr/abc123.png",
  "status": "pending",
  "expires_in": 1200
}`})]})]}),(0,e.jsx)("hr",{className:"border-white/5"}),(0,e.jsxs)("section",{id:"check-status",className:"space-y-8",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(_,{className:"text-primary",size:22}),(0,e.jsx)("h2",{className:"text-2xl font-black tracking-tight",children:"Consultar Status"})]}),(0,e.jsx)("p",{className:"text-white/50",children:"Verifique o status de uma cobrança gerada anteriormente."}),(0,e.jsxs)("div",{className:"flex items-center gap-3 text-xs font-black",children:[(0,e.jsx)("span",{className:"px-3 py-1.5 bg-blue-500 text-white rounded-lg",children:"GET"}),(0,e.jsx)("code",{className:"text-white/50 tracking-wide",children:"/check_status.php?pix_id=SEU_PIX_ID"})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("p",{className:"text-xs font-black text-white/30 uppercase tracking-widest mb-4",children:"Parâmetros Query"}),(0,e.jsx)("table",{className:"w-full text-sm",children:(0,e.jsx)("tbody",{children:(0,e.jsx)(c,{name:"pix_id",type:"string",required:!0,desc:"ID da transação retornado na criação"})})})]}),(0,e.jsx)(x,{tabs:[{label:"cURL",code:'curl "https://diretopay.site/check_status.php?pix_id=abc123-def456"'},{label:"JavaScript",code:`const res = await fetch(
  'https://diretopay.site/check_status.php?pix_id=abc123-def456'
);
const data = await res.json();
console.log(data.status); // "pending", "paid", "expired"`},{label:"Python",code:`import requests

res = requests.get(
    'https://diretopay.site/check_status.php',
    params={'pix_id': 'abc123-def456'}
)
print(res.json()['status'])  # "pending", "paid", "expired"`},{label:"PHP",code:`<?php
$pixId = 'abc123-def456';
$res = file_get_contents(
    "https://diretopay.site/check_status.php?pix_id=$pixId"
);
$data = json_decode($res, true);
echo $data['status']; // "pending", "paid", "expired"`}]}),(0,e.jsxs)("div",{className:"space-y-4",children:[(0,e.jsx)("p",{className:"text-xs font-black text-white/30 uppercase tracking-widest",children:"Resposta — 200 OK"}),(0,e.jsx)(n,{language:"json",code:`{
  "success": true,
  "status": "paid",
  "pix_id": "abc123-def456",
  "amount": 97.00,
  "paid_at": "2026-03-20T14:30:00-03:00"
}`})]}),(0,e.jsxs)("div",{children:[(0,e.jsx)("p",{className:"text-xs font-black text-white/30 uppercase tracking-widest mb-4",children:"Status Possíveis"}),(0,e.jsx)("div",{className:"grid grid-cols-2 sm:grid-cols-4 gap-3",children:[{label:"pending",color:"text-amber-400 bg-amber-500/10 border-amber-500/15",desc:"Aguardando"},{label:"paid",color:"text-emerald-400 bg-emerald-500/10 border-emerald-500/15",desc:"Pago"},{label:"expired",color:"text-white/40 bg-white/5 border-white/5",desc:"Expirado"},{label:"failed",color:"text-red-400 bg-red-500/10 border-red-500/15",desc:"Falhou"}].map(t=>(0,e.jsxs)("div",{className:d("p-3 rounded-xl border text-center",t.color),children:[(0,e.jsx)("code",{className:"text-xs font-bold",children:t.label}),(0,e.jsx)("p",{className:"text-[10px] mt-1 opacity-60",children:t.desc})]},t.label))})]})]}),(0,e.jsx)("hr",{className:"border-white/5"}),(0,e.jsxs)("section",{id:"webhooks",className:"space-y-8",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(R,{className:"text-primary",size:22}),(0,e.jsx)("h2",{className:"text-2xl font-black tracking-tight",children:"Webhooks"})]}),(0,e.jsxs)("p",{className:"text-white/50 leading-relaxed",children:["Quando um pagamento é confirmado, enviamos uma requisição ",(0,e.jsx)("strong",{className:"text-white",children:"POST"})," para a URL que você definiu no campo ",(0,e.jsx)("code",{className:"text-primary bg-primary/10 px-1.5 py-0.5 rounded text-xs",children:"callback_url"})," durante a criação da cobrança."]}),(0,e.jsxs)("div",{className:"space-y-4",children:[(0,e.jsx)("p",{className:"text-xs font-black text-white/30 uppercase tracking-widest",children:"Payload enviado para sua URL"}),(0,e.jsx)(n,{language:"json",code:`{
  "event": "payment.confirmed",
  "pix_id": "abc123-def456",
  "external_id": "pedido_001",
  "amount": 97.00,
  "amount_net": 92.15,
  "status": "paid",
  "paid_at": "2026-03-20T14:30:00-03:00"
}`})]}),(0,e.jsxs)("div",{className:"bg-blue-500/5 border border-blue-500/10 rounded-2xl p-5 flex gap-4",children:[(0,e.jsx)(u,{className:"text-blue-400 shrink-0 mt-0.5",size:18}),(0,e.jsxs)("div",{className:"space-y-2 text-sm text-blue-300/70",children:[(0,e.jsx)("p",{children:(0,e.jsx)("strong",{className:"text-blue-300",children:"Recomendações:"})}),(0,e.jsxs)("ul",{className:"list-disc list-inside space-y-1 text-xs",children:[(0,e.jsxs)("li",{children:["Sempre retorne ",(0,e.jsx)("code",{className:"text-blue-300",children:"HTTP 200"})," para confirmar recebimento"]}),(0,e.jsxs)("li",{children:["Valide o ",(0,e.jsx)("code",{className:"text-blue-300",children:"pix_id"})," no seu banco antes de creditar"]}),(0,e.jsx)("li",{children:"Use HTTPS para proteger os dados recebidos"}),(0,e.jsx)("li",{children:"Implemente idempotência — o webhook pode ser enviado mais de uma vez"})]})]})]}),(0,e.jsxs)("div",{className:"space-y-4",children:[(0,e.jsx)("p",{className:"text-xs font-black text-white/30 uppercase tracking-widest",children:"Exemplo de handler (Node.js / Express)"}),(0,e.jsx)(n,{language:"javascript",code:`app.post('/webhook/diretopay', (req, res) => {
  const { event, pix_id, amount, status } = req.body;

  if (event === 'payment.confirmed' && status === 'paid') {
    // Creditar saldo do cliente no seu sistema
    console.log(\`Pagamento \${pix_id} confirmado: R$ \${amount}\`);

    // Marcar pedido como pago
    // await db.orders.update({ pix_id }, { status: 'paid' });
  }

  res.sendStatus(200); // Sempre retorne 200
});`})]})]}),(0,e.jsx)("hr",{className:"border-white/5"}),(0,e.jsxs)("section",{id:"examples",className:"space-y-8",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(q,{className:"text-primary",size:22}),(0,e.jsx)("h2",{className:"text-2xl font-black tracking-tight",children:"Exemplos Completos"})]}),(0,e.jsx)("p",{className:"text-white/50",children:"Fluxo completo: gerar cobrança → exibir QR → verificar pagamento."}),(0,e.jsx)(x,{tabs:[{label:"Node.js",code:`import express from 'express';

const app = express();
app.use(express.json());

const API_KEY = process.env.DIRETOPAY_API_KEY;
const BASE = 'https://diretopay.site';

// 1. Gerar cobrança
app.post('/pay', async (req, res) => {
  const { amount, customerName } = req.body;

  const pixRes = await fetch(BASE + '/api.php', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${API_KEY}\`
    },
    body: JSON.stringify({
      amount,
      customer: { name: customerName },
      callback_url: 'https://seusite.com/webhook/diretopay'
    })
  });

  const data = await pixRes.json();
  res.json({
    qrCode: data.qr_image,
    pixCode: data.pix_code,
    pixId: data.pix_id
  });
});

// 2. Webhook — pagamento confirmado
app.post('/webhook/diretopay', (req, res) => {
  const { pix_id, status, amount } = req.body;
  if (status === 'paid') {
    console.log(\`✅ Pago: \${pix_id} - R$ \${amount}\`);
    // Ativar plano, liberar produto, etc.
  }
  res.sendStatus(200);
});

app.listen(3000);`},{label:"Python / Flask",code:`from flask import Flask, request, jsonify
import requests, os

app = Flask(__name__)
API_KEY = os.environ['DIRETOPAY_API_KEY']
BASE = 'https://diretopay.site'

# 1. Gerar cobrança
@app.route('/pay', methods=['POST'])
def pay():
    data = request.json
    res = requests.post(f'{BASE}/api.php',
        headers={'Authorization': f'Bearer {API_KEY}'},
        json={
            'amount': data['amount'],
            'customer': {'name': data.get('name', '')},
            'callback_url': 'https://seusite.com/webhook/diretopay'
        }
    )
    pix = res.json()
    return jsonify({
        'qr_code': pix['qr_image'],
        'pix_code': pix['pix_code'],
        'pix_id': pix['pix_id']
    })

# 2. Webhook — pagamento confirmado
@app.route('/webhook/diretopay', methods=['POST'])
def webhook():
    data = request.json
    if data.get('status') == 'paid':
        print(f"✅ Pago: {data['pix_id']} - R$ {data['amount']}")
        # Ativar plano, liberar produto, etc.
    return '', 200

app.run(port=3000)`},{label:"PHP / Laravel",code:`<?php
// routes/api.php

use Illuminate\\Http\\Request;
use Illuminate\\Support\\Facades\\Http;
use Illuminate\\Support\\Facades\\Route;

// 1. Gerar cobrança
Route::post('/pay', function (Request $request) {
    $response = Http::withHeaders([
        'Authorization' => 'Bearer ' . env('DIRETOPAY_API_KEY'),
    ])->post('https://diretopay.site/api.php', [
        'amount' => $request->amount,
        'customer' => ['name' => $request->name ?? ''],
        'callback_url' => url('/api/webhook/diretopay'),
    ]);

    $pix = $response->json();
    return response()->json([
        'qr_code' => $pix['qr_image'],
        'pix_code' => $pix['pix_code'],
        'pix_id'   => $pix['pix_id'],
    ]);
});

// 2. Webhook — pagamento confirmado
Route::post('/webhook/diretopay', function (Request $request) {
    if ($request->status === 'paid') {
        logger("✅ Pago: {$request->pix_id} - R\\$ {$request->amount}");
        // Ativar plano, liberar produto, etc.
    }
    return response('OK', 200);
});`},{label:"React (Frontend)",code:`import { useState } from 'react';

export default function PaymentPage() {
  const [pixData, setPixData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    // Chame SEU backend (nunca exponha a API key no frontend!)
    const res = await fetch('/api/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 49.90, name: 'Cliente' })
    });
    const data = await res.json();
    setPixData(data);
    setLoading(false);

    // Polling para verificar pagamento
    const interval = setInterval(async () => {
      const statusRes = await fetch(
        \`https://diretopay.site/check_status.php?pix_id=\${data.pixId}\`
      );
      const status = await statusRes.json();
      if (status.status === 'paid') {
        clearInterval(interval);
        alert('Pagamento confirmado!');
      }
    }, 4000);
  };

  return (
    <div>
      <button onClick={handlePay} disabled={loading}>
        {loading ? 'Gerando...' : 'Pagar com Pix'}
      </button>

      {pixData && (
        <div>
          <img src={pixData.qrCode} alt="QR Code" />
          <input value={pixData.pixCode} readOnly />
        </div>
      )}
    </div>
  );
}`}]})]}),(0,e.jsx)("hr",{className:"border-white/5"}),(0,e.jsxs)("section",{id:"errors",className:"space-y-8",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(j,{className:"text-primary",size:22}),(0,e.jsx)("h2",{className:"text-2xl font-black tracking-tight",children:"Códigos de Erro"})]}),(0,e.jsx)("p",{className:"text-white/50",children:"Todas as respostas de erro seguem o mesmo formato JSON."}),(0,e.jsx)(n,{language:"json",code:`{
  "success": false,
  "error": "Descrição do erro"
}`}),(0,e.jsx)("div",{className:"overflow-x-auto",children:(0,e.jsxs)("table",{className:"w-full text-sm",children:[(0,e.jsx)("thead",{children:(0,e.jsxs)("tr",{className:"text-left text-white/15 text-[10px] font-black uppercase tracking-widest border-b border-white/5",children:[(0,e.jsx)("th",{className:"pb-3 pr-4",children:"HTTP"}),(0,e.jsx)("th",{className:"pb-3 pr-4",children:"Erro"}),(0,e.jsx)("th",{className:"pb-3",children:"Causa / Solução"})]})}),(0,e.jsx)("tbody",{className:"divide-y divide-white/5",children:[["400","Valor mínimo R$ 10","O campo amount deve ser ≥ 10.00"],["401","API Key inválida","Verifique sua chave em Configurações → API"],["403","Conta não aprovada","Sua conta ainda está pendente de aprovação pelo admin"],["429","Rate limit excedido","Aguarde 1 minuto antes de tentar novamente"],["500","Erro interno do servidor","Tente novamente. Se persistir, contate o suporte"],["502","Gateway indisponível","O provedor de pagamento está temporariamente offline"]].map(([t,a,s])=>(0,e.jsxs)("tr",{children:[(0,e.jsx)("td",{className:"py-3 pr-4",children:(0,e.jsx)("span",{className:d("px-2 py-1 rounded text-xs font-mono font-bold",parseInt(t)>=500?"text-red-400 bg-red-500/10":parseInt(t)>=400?"text-amber-400 bg-amber-500/10":"text-white/50"),children:t})}),(0,e.jsx)("td",{className:"py-3 pr-4 text-white/60 font-medium",children:a}),(0,e.jsx)("td",{className:"py-3 text-white/40",children:s})]},t))})]})})]}),(0,e.jsx)("hr",{className:"border-white/5"}),(0,e.jsxs)("section",{id:"sdks",className:"space-y-8",children:[(0,e.jsxs)("div",{className:"flex items-center gap-3",children:[(0,e.jsx)(m,{className:"text-primary",size:22}),(0,e.jsx)("h2",{className:"text-2xl font-black tracking-tight",children:"SDKs & Integrações"})]}),(0,e.jsx)("p",{className:"text-white/50",children:"A DiretoPay API é compatível com qualquer linguagem ou plataforma que suporte requisições HTTP."}),(0,e.jsx)("div",{className:"grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3",children:[{name:"Node.js",desc:"fetch / axios"},{name:"Python",desc:"requests"},{name:"PHP",desc:"cURL / Guzzle"},{name:"Java",desc:"HttpClient"},{name:"C# / .NET",desc:"HttpClient"},{name:"Ruby",desc:"Net::HTTP / Faraday"},{name:"Go",desc:"net/http"},{name:"React / Next.js",desc:"via backend API"},{name:"Flutter / Dart",desc:"http package"},{name:"Swift / iOS",desc:"URLSession"},{name:"Kotlin / Android",desc:"OkHttp / Retrofit"},{name:"WordPress",desc:"WP REST + cURL"}].map(t=>(0,e.jsxs)("div",{className:"p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all group",children:[(0,e.jsx)("p",{className:"text-sm font-bold text-white/70 group-hover:text-primary transition-colors",children:t.name}),(0,e.jsx)("p",{className:"text-[10px] text-white/25 mt-1",children:t.desc})]},t.name))}),(0,e.jsxs)("div",{className:"bg-primary/[0.03] border border-primary/10 rounded-2xl p-5 flex gap-4",children:[(0,e.jsx)(u,{className:"text-primary shrink-0 mt-0.5",size:18}),(0,e.jsxs)("p",{className:"text-sm text-primary/70",children:[(0,e.jsx)("strong",{className:"text-primary",children:"Dica:"})," Nossa API é uma REST API padrão. Qualquer ferramenta como ",(0,e.jsx)("strong",{children:"Postman"}),", ",(0,e.jsx)("strong",{children:"Insomnia"}),", ",(0,e.jsx)("strong",{children:"Bruno"})," ou ",(0,e.jsx)("strong",{children:"Thunder Client"})," pode ser usada para testes."]})]})]}),(0,e.jsxs)("div",{className:"bg-gradient-to-br from-primary/[0.05] to-transparent p-10 lg:p-14 rounded-[40px] border border-primary/10 space-y-6 relative overflow-hidden",children:[(0,e.jsx)("div",{className:"absolute top-0 right-0 p-8 text-primary/5",children:(0,e.jsx)(m,{size:140})}),(0,e.jsx)("h3",{className:"text-3xl font-black tracking-tighter relative",children:"Pronto para integrar?"}),(0,e.jsx)("p",{className:"text-white/40 max-w-xl relative",children:"Crie sua conta, obtenha sua API Key e comece a receber pagamentos Pix em minutos."}),(0,e.jsxs)("div",{className:"flex flex-wrap gap-4 relative",children:[(0,e.jsx)(o,{to:"/register",className:"bg-primary text-black px-8 py-3.5 rounded-2xl font-black text-sm hover:scale-[1.02] transition-all shadow-[0_10px_30px_rgba(74,222,128,0.15)]",children:"COMEÇAR AGORA"}),(0,e.jsx)(o,{to:"/login",className:"bg-white/5 text-white/60 px-8 py-3.5 rounded-2xl font-bold text-sm border border-white/10 hover:text-white hover:bg-white/10 transition-all",children:"JÁ TENHO CONTA"})]})]})]})]}),(0,e.jsx)("footer",{className:"py-16 border-t border-white/5 bg-black/40 px-6",children:(0,e.jsxs)("div",{className:"max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-white/20",children:[(0,e.jsx)("p",{className:"text-[10px] font-black uppercase tracking-[0.3em]",children:"© 2026 DiretoPay DEVELOPERS"}),(0,e.jsxs)("div",{className:"flex gap-8 text-[10px] font-bold uppercase tracking-widest",children:[(0,e.jsx)(o,{to:"/",className:"hover:text-white transition-colors",children:"Início"}),(0,e.jsx)(o,{to:"/docs",className:"hover:text-white transition-colors",children:"Documentação"}),(0,e.jsx)(o,{to:"/register",className:"hover:text-primary transition-colors",children:"Criar Conta"})]})]})})]})}export{L as default};
