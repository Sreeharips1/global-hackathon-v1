import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, content, format = 'pdf' } = await req.json();

    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    console.log(`Generating ${format} export for: ${title}`);

    // For PDF, we'll create a simple HTML to PDF conversion
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              line-height: 1.6;
              max-width: 800px;
              margin: 40px auto;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #3aafa9;
              border-bottom: 2px solid #def2f1;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            p {
              margin-bottom: 15px;
              text-align: justify;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #def2f1;
              text-align: center;
              color: #999;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div>${content.replace(/\n/g, '</p><p>')}</div>
          <div class="footer">
            <p>Generated from Memory Keeper • ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;

    if (format === 'docx') {
      // For DOCX, create a simple Word XML format
      const docxContent = `
        <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
        <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
          <w:body>
            <w:p><w:r><w:t>${title}</w:t></w:r></w:p>
            <w:p><w:r><w:t>${content}</w:t></w:r></w:p>
          </w:body>
        </w:document>
      `;
      
      return new Response(
        JSON.stringify({ 
          content: btoa(docxContent),
          filename: `${title.replace(/[^a-z0-9]/gi, '_')}.docx`,
          mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // For PDF, return base64 encoded HTML (client will handle PDF conversion)
    return new Response(
      JSON.stringify({ 
        content: btoa(html),
        filename: `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`,
        mimeType: 'application/pdf',
        html: html // Send HTML for client-side PDF generation
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in export:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    );
  }
});
