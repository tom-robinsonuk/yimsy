from transformers import AutoModelForImageClassification
import torch
import os

model_name = "eslamxm/vit-base-food101"
model = AutoModelForImageClassification.from_pretrained(model_name)
model.eval()

dummy_input = torch.randn(1, 3, 224, 224)
onnx_path = os.path.join("backend", "model", "food101.onnx")

torch.onnx.export(
    model,
    dummy_input,
    onnx_path,
    export_params=True,
    opset_version=17,
    do_constant_folding=True,
    input_names=["input"],
    output_names=["output"],
    dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
)

print(f"Exported ONNX model to {onnx_path}")
