package slices

func DistinctString(objs []string) []string {
	res := make([]string, 0, len(objs))
	exist := make(map[string]struct{}, len(objs))
	for _, obj := range objs {
		if _, found := exist[obj]; !found {
			res = append(res, obj)
			exist[obj] = struct{}{}
		}
	}
	return res
}
