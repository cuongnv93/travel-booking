import { Request, Response } from 'express';
import Setting from '../models/Setting';
import { cacheService } from '../services/cacheService';
import { runMasterSettingsSeed, MASTER_SETTINGS_SEEDS } from '../utils/seedMasterSettings';

export const getAll = async (_req: Request, res: Response) => {
  try {
    const cached = cacheService.get('settings_all');
    if (cached) return res.json(cached);

    const settings = await Setting.find().lean();
    cacheService.set('settings_all', settings, 300);
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getByGroup = async (req: Request, res: Response) => {
  try {
    const { group } = req.params;
    const cacheKey = `settings_group_${group}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    const settings = await Setting.find({ group }).lean();
    cacheService.set(cacheKey, settings, 300);
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const cacheKey = `setting_${key}`;
    const cached = cacheService.get(cacheKey);
    if (cached) return res.json(cached);

    let setting: any = await Setting.findOne({ key }).lean();
    if (!setting) {
      // Auto-fallback from master seed definitions if key was not yet saved
      const seedItem = MASTER_SETTINGS_SEEDS.find((s) => s.key === key);
      if (seedItem) {
        setting = await Setting.create({
          key: seedItem.key,
          group: seedItem.group,
          value: seedItem.value,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else {
        return res.status(404).json({ message: 'Không tìm thấy cài đặt này' });
      }
    }

    cacheService.set(cacheKey, setting, 300);
    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const upsert = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const group = req.body.group;

    cacheService.del('settings_all');
    cacheService.del(`setting_${key}`);
    if (group) {
      cacheService.del(`settings_group_${group}`);
    }

    const setting = await Setting.findOneAndUpdate(
      { key },
      { ...req.body, key, updatedAt: new Date() },
      { new: true, upsert: true }
    );

    if (setting?.group) {
      cacheService.del(`settings_group_${setting.group}`);
    }

    res.json(setting);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const batchUpsert = async (req: Request, res: Response) => {
  try {
    const items = req.body.items || req.body.settings;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Danh sách cài đặt (items/settings) không được để trống' });
    }

    cacheService.del('settings_all');
    const updatedSettings = [];

    for (const item of items) {
      if (!item.key) continue;
      cacheService.del(`setting_${item.key}`);
      if (item.group) cacheService.del(`settings_group_${item.group}`);

      const saved = await Setting.findOneAndUpdate(
        { key: item.key },
        { ...item, updatedAt: new Date() },
        { new: true, upsert: true }
      );
      if (saved?.group) cacheService.del(`settings_group_${saved.group}`);
      updatedSettings.push(saved);
    }

    res.json({ message: 'Cập nhật cấu hình thành công', data: updatedSettings });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const seedMaster = async (req: Request, res: Response) => {
  try {
    const force = req.query.force === 'true';
    const result = await runMasterSettingsSeed(force);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const seedMultiLang = async (_req: Request, res: Response) => {
  try {
    // Re-use runMasterSettingsSeed(true) directly instead of duplicating 150 lines of static JSON
    const result = await runMasterSettingsSeed(true);
    res.json({ message: 'Đồng bộ dữ liệu đa ngôn ngữ thành công!', result });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
