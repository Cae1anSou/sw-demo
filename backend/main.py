from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any
import json
import os
from datetime import datetime

# 定义元素信息模型
class ElementBBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class ElementInfo(BaseModel):
    selector: str  # XPath或CSS选择器
    outerHTML: str = Field(..., description="元素的HTML片段")
    bbox: ElementBBox
    tagName: str
    id: Optional[str] = None
    classList: List[str] = []
    pageURL: str

# 创建FastAPI应用
app = FastAPI(
    title="AI教学系统 - 元素选择API",
    description="接收从前端选中的元素信息，用于AI教学系统的分析和教学",
    version="0.1.0"
)

# 添加CORS中间件，允许前端站点访问API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置为具体的前端域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 存储选中的元素（实际项目中应使用数据库）
ELEMENTS_DIR = "stored_elements"
os.makedirs(ELEMENTS_DIR, exist_ok=True)

@app.get("/")
async def root():
    return {"message": "欢迎使用元素选择API"}

@app.post("/api/element", response_model=Dict[str, Any])
async def receive_element(info: ElementInfo):
    """
    接收从前端选中的元素信息
    """
    try:
        # 生成唯一ID，实际项目中可使用UUID
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        element_id = f"element_{timestamp}"
        
        # 将元素信息保存到JSON文件
        filename = f"{ELEMENTS_DIR}/{element_id}.json"
        with open(filename, "w", encoding="utf-8") as f:
            json.dump(info.model_dump(), f, ensure_ascii=False, indent=2)
        
        # 这里可以添加额外的处理逻辑，如：
        # - 发送到AI分析服务
        # - 生成教学内容
        # - 存储到数据库等
        
        return {
            "status": "success",
            "message": "元素信息已成功接收",
            "element_id": element_id,
            "next_steps": [
                "AI正在分析元素...",
                "准备生成相关教学内容",
                "可以继续选择其他元素，或进入下一步学习"
            ]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理元素信息时出错: {str(e)}")

@app.get("/api/elements", response_model=List[Dict[str, Any]])
async def get_elements():
    """
    获取所有已保存的元素信息
    """
    elements = []
    try:
        for filename in os.listdir(ELEMENTS_DIR):
            if filename.endswith(".json"):
                with open(os.path.join(ELEMENTS_DIR, filename), "r", encoding="utf-8") as f:
                    element_data = json.load(f)
                    element_id = filename.replace(".json", "")
                    elements.append({
                        "id": element_id,
                        **element_data
                    })
        return elements
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取元素信息时出错: {str(e)}")

@app.get("/api/element/{element_id}", response_model=Dict[str, Any])
async def get_element(element_id: str):
    """
    获取指定ID的元素信息
    """
    try:
        filepath = os.path.join(ELEMENTS_DIR, f"{element_id}.json")
        if not os.path.exists(filepath):
            raise HTTPException(status_code=404, detail=f"未找到ID为 {element_id} 的元素")
        
        with open(filepath, "r", encoding="utf-8") as f:
            element_data = json.load(f)
            
        return {
            "id": element_id,
            **element_data
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取元素信息时出错: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
