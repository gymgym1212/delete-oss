const core = require('@actions/core');
const OSS = require('ali-oss');

const client = new OSS({
  // yourregion填写Bucket所在地域。以华东1（杭州）为例，Region填写为oss-cn-hangzhou。
  region: core.getInput('region'),
  //  阿里云账号AccessKey拥有所有API的访问权限，风险很高。强烈建议您创建并使用RAM用户进行API访问或日常运维，请登录RAM控制台创建RAM用户。
  accessKeyId: core.getInput('key-id'),
  accessKeySecret: core.getInput('key-secret'),
  // 填写Bucket名称。
  bucket: core.getInput('bucket'),
});

// 处理请求失败的情况，防止promise.all中断，并返回失败原因和失败文件名。
async function handleDel(name, options) {
  try {
    await client.delete(name);
  } catch (error) {
    error.failObjectName = name;
    return error;
  }
}

// 删除所有文件。
// 由于每次查询最多返回 100 个文件，循环实现。
async function deleteAll() {
  let list;
  do{
    list = await client.list();
    list.objects = list.objects || [];
    const result = await Promise.all(list.objects.map((v) => handleDel(v.name)));
  }
  while(list.objects.length>0);
}

deleteAll();