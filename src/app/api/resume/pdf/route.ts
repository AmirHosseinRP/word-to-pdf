import { NextRequest, NextResponse } from "next/server";
import env from "~/shared/config/env";
import ServerException from "~/shared/config/server-exception";

export async function GET(request: NextRequest) {
  const cloudConvertApiKey = process.env.RP_CLOUDCONVERT_API_KEY;

  const cloudConvertBaseUrl = env.links.cloudConvert;

  const url = new URL(request.url);
  const link = url.searchParams.get("link");
  const clientId = url.searchParams.get("clientId");

  if (!link || !clientId) {
    return ServerException({
      status: 500,
      codeOffset: 0,
      referenceNumber: null,
      message: "Invalid Params",
    });
  }

  if (clientId !== process.env.RP_WHITE_LIST) {
    return ServerException({
      status: 403,
      codeOffset: 0,
      referenceNumber: null,
      message: "Forbidden",
    });
  }

  if (!url || !cloudConvertApiKey || !cloudConvertBaseUrl) {
    return ServerException({
      status: 500,
      codeOffset: 0,
      referenceNumber: null,
      message: "Internal Server Error",
    });
  }

  try {
    const docxBlob = await fetch(url).then(res => res.blob());
    const docxFile = new File([docxBlob], "google-doc.docx", {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const jobRes = await fetch(`${cloudConvertBaseUrl}/v2/jobs`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cloudConvertApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tasks: {
          import_file: {
            operation: "import/upload",
          },
          convert_file: {
            operation: "convert",
            input: "import_file",
            input_format: "docx",
            output_format: "pdf",
          },
          export_file: {
            operation: "export/url",
            input: "convert_file",
            inline: false,
            archive_multiple_files: false,
          },
        },
      }),
    });

    const job = await jobRes.json();
    const uploadTask = job.data.tasks.find((t: { name: string }) => t.name === "import_file");
    const uploadUrl = uploadTask.result.form.url;
    const formFields = uploadTask.result.form.parameters;

    const formData = new FormData();
    Object.entries(formFields).forEach(([key, val]) => formData.append(key, val as string));
    formData.append("file", docxFile);

    await fetch(uploadUrl, {
      method: "POST",
      body: formData,
    });

    const jobId = job.data.id;
    let pdfUrl = "";
    for (let i = 0; i < 20; i++) {
      const statusRes = await fetch(`${cloudConvertBaseUrl}/v2/jobs/${jobId}`, {
        headers: { Authorization: `Bearer ${cloudConvertApiKey}` },
      });
      const statusData = await statusRes.json();

      const exportTask = statusData.data.tasks.find(
        (t: { name: string; status: string }) => t.name === "export_file" && t.status === "finished"
      );

      if (exportTask) {
        pdfUrl = exportTask.result.files[0].url;
        break;
      }

      await new Promise(res => setTimeout(res, 1500));
    }

    if (!pdfUrl) {
      return ServerException({
        status: 500,
        codeOffset: 0,
        referenceNumber: null,
        message: "Conversion failed or timed out",
      });
    }

    const data = {
      link: pdfUrl,
    };

    return NextResponse.json({ code: 0, message: "", result: data }, { status: 200 });
  } catch {
    return ServerException({
      status: 500,
      codeOffset: 0,
      referenceNumber: null,
      message: "An error occurred during conversion.",
    });
  }
}
